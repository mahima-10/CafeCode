"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilterBar } from "@/components/FilterBar";
import { AddCafeForm } from "@/components/AddCafeForm";
import { fetchCafes } from "@/lib/api";
import { CafeAggregated } from "@/lib/types";
import { toast } from "sonner";

const CafeMap = dynamic(() => import("@/components/CafeMap").then((m) => ({ default: m.CafeMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50 gap-3">
      <div className="flex gap-1.5">
        <span className="text-2xl animate-brew">&#9749;</span>
        <span className="text-2xl animate-brew-delay">&#9749;</span>
        <span className="text-2xl animate-brew-delay-2">&#9749;</span>
      </div>
      <p className="text-sm text-muted-foreground">Brewing your map...</p>
    </div>
  ),
});

const vibeBadge: Record<string, { label: string; className: string }> = {
  great: { label: "Great", className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300" },
  okay: { label: "Okay", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300" },
  not_ideal: { label: "Skip", className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300" },
};

const priceLabels: Record<string, string> = {
  budget: "₹80-150",
  mid: "₹150-300",
  premium: "₹300+",
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type SheetState = "collapsed" | "peek" | "full";

export default function HomePage() {
  const [cafes, setCafes] = useState<CafeAggregated[]>([]);
  const [filters, setFilters] = useState<Record<string, string | boolean | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [addCafeOpen, setAddCafeOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [sortNear, setSortNear] = useState(false);
  const [sheet, setSheet] = useState<SheetState>("peek");
  const [imHereOpen, setImHereOpen] = useState(false);
  const [locatingHere, setLocatingHere] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartTranslate = useRef<number>(0);

  useEffect(() => setMounted(true), []);

  const loadCafes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCafes(filters);
      setCafes(data);
    } catch {
      toast.error("Couldn't load cafes. Try refreshing?");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCafes();
  }, [loadCafes]);

  const totalReports = useMemo(() => cafes.reduce((sum, c) => sum + c.report_count, 0), [cafes]);

  const displayCafes = useMemo(() => {
    let result = cafes;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q)
      );
    }
    if (sortNear && userPos) {
      result = [...result].sort(
        (a, b) =>
          getDistance(userPos[0], userPos[1], a.latitude, a.longitude) -
          getDistance(userPos[0], userPos[1], b.latitude, b.longitude)
      );
    }
    return result;
  }, [cafes, search, sortNear, userPos]);

  function handleImHere() {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setLocatingHere(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setImHereOpen(true);
        setLocatingHere(false);
      },
      () => { toast.error("Couldn't get your location."); setLocatingHere(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleNearMe() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setSortNear(true);
        setSheet("full");
        toast.success("Sorted by distance");
      },
      () => toast.error("Couldn't get your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Sheet height percentages
  const sheetHeight = sheet === "full" ? "70vh" : sheet === "peek" ? "28vh" : "0px";

  // Touch handlers for sheet drag
  function handleTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
    const el = sheetRef.current;
    if (el) {
      const transform = window.getComputedStyle(el).transform;
      const matrix = new DOMMatrixReadOnly(transform);
      dragStartTranslate.current = matrix.m42;
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (dragStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - dragStartY.current;
    dragStartY.current = null;

    // Snap logic
    if (deltaY < -60) {
      // Swiped up
      setSheet(sheet === "collapsed" ? "peek" : "full");
    } else if (deltaY > 60) {
      // Swiped down
      setSheet(sheet === "full" ? "peek" : "collapsed");
    }
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        {loading && cafes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-muted/30 gap-3">
            <div className="flex gap-1.5">
              <span className="text-2xl animate-brew">&#9749;</span>
              <span className="text-2xl animate-brew-delay">&#9749;</span>
              <span className="text-2xl animate-brew-delay-2">&#9749;</span>
            </div>
            <p className="text-sm text-muted-foreground">Brewing your map...</p>
          </div>
        ) : (
          <CafeMap cafes={displayCafes} />
        )}
      </div>

      {/* Floating top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="p-3 sm:p-4 space-y-2 pointer-events-auto">
          {/* Brand row */}
          <div className="flex items-center gap-2">
            <div className="bg-background/90 backdrop-blur-md rounded-2xl shadow-lg border border-border/50 px-4 py-2.5 flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">&#9749;</span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight">CafeCode</h1>
              </div>
              <div className="h-5 w-px bg-border/60 hidden sm:block" />
              <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block leading-tight">
                by <span className="font-semibold text-foreground/70">m</span>
              </p>
              {cafes.length > 0 && (
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/70">{cafes.length}</span> spots
                    {" · "}
                    <span className="font-semibold text-foreground/70">{totalReports}</span> reviews
                  </span>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="bg-background/90 backdrop-blur-md rounded-xl shadow-lg border border-border/50 p-2.5 hover:bg-accent transition-colors"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </button>
            )}
          </div>

          {/* Search + actions row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <Input
                placeholder="Search cafes or areas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value && sheet === "collapsed") setSheet("peek");
                }}
                onFocus={() => {
                  if (sheet === "collapsed") setSheet("peek");
                }}
                className="h-10 pl-9 text-sm bg-background/90 backdrop-blur-md shadow-lg border-border/50 rounded-xl"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <button
              onClick={handleNearMe}
              aria-label="Sort by distance"
              className={`h-10 px-3 rounded-xl shadow-lg border border-border/50 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                sortNear
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/90 backdrop-blur-md hover:bg-accent text-foreground"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
              <span className="hidden sm:inline">Near me</span>
            </button>
          </div>

          {/* Filters row */}
          <div className="bg-background/90 backdrop-blur-md rounded-xl shadow-lg border border-border/50 px-3 py-1">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 z-[1000] bottom-sheet"
        style={{
          height: "72vh",
          transform: `translateY(calc(100% - ${sheetHeight}))`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-background rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)] border-t border-border/50 h-full flex flex-col">
          {/* Handle + controls */}
          <div className="pt-2.5 pb-2 px-4 flex-shrink-0">
            <div className="flex justify-center mb-2">
              <div className="bottom-sheet-handle" />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSheet(sheet === "collapsed" ? "peek" : sheet === "peek" ? "full" : "collapsed")}
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform ${sheet === "full" ? "rotate-180" : ""}`}
                >
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                {displayCafes.length} {displayCafes.length === 1 ? "spot" : "spots"}
                {search && " found"}
              </button>

              <div className="flex items-center gap-2">
                <Dialog open={addCafeOpen} onOpenChange={setAddCafeOpen}>
                  <DialogTrigger render={
                    <button className="text-xs text-primary hover:underline font-medium" />
                  }>
                    + Add spot
                  </DialogTrigger>
                  <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Know a good work-from-cafe spot?</DialogTitle>
                    </DialogHeader>
                    <AddCafeForm
                      onSuccess={() => {
                        setAddCafeOpen(false);
                        loadCafes();
                        toast.success("Spot added! Thanks for sharing.");
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Cafe list */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-24">
            {displayCafes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No spots match your search.</p>
                <p className="text-xs text-muted-foreground mt-1">Try different filters or add a new one.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayCafes.map((cafe, i) => {
                  const vibe = vibeBadge[cafe.overall_vibe] || vibeBadge.not_ideal;
                  const dist = sortNear && userPos
                    ? getDistance(userPos[0], userPos[1], cafe.latitude, cafe.longitude)
                    : null;
                  return (
                    <Link key={cafe.id} href={`/cafe/${cafe.id}`}>
                      <div
                        className="bg-card rounded-xl border border-border/50 p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm leading-tight">{cafe.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {cafe.area}
                              {dist !== null && (
                                <span className="ml-1 text-primary font-medium">
                                  {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                                </span>
                              )}
                            </p>
                          </div>
                          <Badge className={`shrink-0 text-[10px] font-semibold ${vibe.className}`}>
                            {vibe.label}
                          </Badge>
                        </div>

                        <TagIndicators cafe={cafe} />

                        <div className="flex items-center justify-between mt-2">
                          {cafe.long_stay_friendly_pct !== null && (
                            <span className={`text-[11px] font-medium ${cafe.long_stay_friendly_pct >= 50 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                              {cafe.long_stay_friendly_pct >= 50 ? "Can sit for hours" : "Quick visits only"}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground ml-auto">
                            {cafe.report_count} {cafe.report_count === 1 ? "review" : "reviews"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* Footer */}
                <div className="text-center py-6 space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    Made with &#9749; for Bangalore&apos;s remote workers
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    No login. No ads. Just honest reviews.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Legend — bottom left on map */}
      {sheet === "collapsed" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 sm:bottom-20 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 px-2.5 py-2 flex gap-2.5 text-[10px] z-[998] shadow-sm">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Great
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Okay
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Skip
          </span>
        </div>
      )}

      {/* "I'm at a cafe" FAB — hidden when sheet is up */}
      <button
        onClick={handleImHere}
        disabled={locatingHere}
        aria-label="I'm at a cafe"
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[999] bg-primary hover:bg-primary/90 text-primary-foreground rounded-full pl-4 pr-5 py-3 shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-2 text-sm font-semibold ${sheet !== "collapsed" ? "translate-y-24 opacity-0 pointer-events-none" : ""}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        {locatingHere ? "Finding you..." : "I'm at a cafe"}
      </button>

      {/* "I'm here" dialog */}
      <Dialog open={imHereOpen} onOpenChange={setImHereOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add the cafe you&apos;re at</DialogTitle>
          </DialogHeader>
          <AddCafeForm
            onSuccess={() => {
              setImHereOpen(false);
              loadCafes();
              toast.success("Spot added! Thanks for sharing.");
            }}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}

function TagIndicators({ cafe }: { cafe: CafeAggregated }) {
  const tags: { label: string; variant?: "good" | "neutral" | "bad" }[] = [];
  if (cafe.avg_wifi_speed !== null) {
    const speed = cafe.avg_wifi_speed;
    tags.push({ label: `${speed} Mbps`, variant: speed >= 20 ? "good" : speed >= 10 ? "neutral" : "bad" });
  }
  if (cafe.most_common_power_outlets) {
    const v = cafe.most_common_power_outlets;
    tags.push({ label: v === "plenty" ? "Plenty of outlets" : v === "few" ? "Few outlets" : "No outlets", variant: v === "plenty" ? "good" : v === "none" ? "bad" : "neutral" });
  }
  if (cafe.most_common_noise_level) {
    const v = cafe.most_common_noise_level;
    tags.push({ label: v.charAt(0).toUpperCase() + v.slice(1), variant: v === "quiet" ? "good" : v === "moderate" ? "neutral" : "bad" });
  }
  if (cafe.most_common_seating_comfort) {
    const v = cafe.most_common_seating_comfort;
    tags.push({ label: `${v.charAt(0).toUpperCase() + v.slice(1)} seating` });
  }
  if (cafe.most_common_price_range) {
    tags.push({ label: priceLabels[cafe.most_common_price_range] || cafe.most_common_price_range });
  }
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span
          key={i}
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            tag.variant === "good"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : tag.variant === "bad"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
