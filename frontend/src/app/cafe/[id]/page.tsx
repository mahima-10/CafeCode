"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportForm } from "@/components/ReportForm";
import { ReportCard } from "@/components/ReportCard";
import { fetchCafe } from "@/lib/api";
import { CafeDetail } from "@/lib/types";
import { toast } from "sonner";

const vibeMeta: Record<string, { label: string; bg: string; text: string; accent: string }> = {
  great: {
    label: "Great for working",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-800 dark:text-green-300",
    accent: "from-green-500 to-emerald-400",
  },
  okay: {
    label: "Okay for working",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-800 dark:text-yellow-300",
    accent: "from-yellow-500 to-amber-400",
  },
  not_ideal: {
    label: "Not ideal for working",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-800 dark:text-red-300",
    accent: "from-red-500 to-orange-400",
  },
};

const priceLabels: Record<string, string> = {
  budget: "Budget (₹80-150)",
  mid: "Mid-range (₹150-300)",
  premium: "Premium (₹300+)",
};

export default function CafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const loadCafe = useCallback(async () => {
    try {
      const data = await fetchCafe(id);
      setCafe(data);
    } catch {
      toast.error("Couldn't load this cafe. Try refreshing?");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCafe();
  }, [loadCafe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-1.5 bg-muted animate-pulse" />
        <header className="border-b">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
          <div className="rounded-2xl border border-border/30 p-5">
            <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-28 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                  <div className="h-5 w-14 bg-muted rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Cafe not found.</p>
        <Link href="/"><Button variant="outline">Back to map</Button></Link>
      </div>
    );
  }

  const reports = cafe.reports;
  const reportCount = reports.length;

  const wifiSpeeds = reports.filter((r) => r.wifi_speed_mbps !== null).map((r) => r.wifi_speed_mbps!);
  const avgWifi = wifiSpeeds.length > 0 ? (wifiSpeeds.reduce((a, b) => a + b, 0) / wifiSpeeds.length).toFixed(1) : null;

  const wifiReliable = reports.filter((r) => r.wifi_reliable !== null);
  const wifiReliablePct = wifiReliable.length > 0
    ? Math.round((wifiReliable.filter((r) => r.wifi_reliable).length / wifiReliable.length) * 100)
    : null;

  const longStay = reports.filter((r) => r.long_stay_friendly !== null);
  const longStayPct = longStay.length > 0
    ? Math.round((longStay.filter((r) => r.long_stay_friendly).length / longStay.length) * 100)
    : null;

  function mostCommon(values: (string | null)[]) {
    const filtered = values.filter(Boolean) as string[];
    if (filtered.length === 0) return null;
    const counts = filtered.reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  const commonPower = mostCommon(reports.map((r) => r.power_outlets));
  const commonNoise = mostCommon(reports.map((r) => r.noise_level));
  const commonSeating = mostCommon(reports.map((r) => r.seating_comfort));
  const commonPrice = mostCommon(reports.map((r) => r.coffee_price_range));

  let overallVibe: "great" | "okay" | "not_ideal" = "okay";
  if (reportCount > 0) {
    let score = 0;
    let count = 0;
    if (avgWifi !== null) { score += Number(avgWifi) >= 20 ? 2 : Number(avgWifi) >= 10 ? 1 : 0; count++; }
    if (wifiReliablePct !== null) { score += wifiReliablePct >= 70 ? 2 : wifiReliablePct >= 40 ? 1 : 0; count++; }
    if (longStayPct !== null) { score += longStayPct >= 70 ? 2 : longStayPct >= 40 ? 1 : 0; count++; }
    if (commonNoise) { score += commonNoise === "quiet" ? 2 : commonNoise === "moderate" ? 1 : 0; count++; }
    if (commonPower) { score += commonPower === "plenty" ? 2 : commonPower === "few" ? 1 : 0; count++; }
    if (count > 0) {
      const avg = score / count;
      overallVibe = avg >= 1.5 ? "great" : avg >= 0.8 ? "okay" : "not_ideal";
    }
  }

  const vibe = vibeMeta[overallVibe] || vibeMeta.okay;

  const sortedReports = sortOrder === "newest"
    ? reports
    : [...reports].reverse();

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient accent header */}
      <div className={`h-1.5 bg-gradient-to-r ${vibe.accent}`} />

      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to map
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{cafe.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{cafe.area}</p>
              {cafe.google_maps_link && (
                <a
                  href={cafe.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1.5 inline-flex items-center gap-1"
                >
                  Open in Google Maps
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                </a>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              aria-label="Share this cafe"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied!");
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* The Vibe card */}
        {reportCount > 0 && (
          <div className={`rounded-2xl overflow-hidden border border-border/30`}>
            <div className={`${vibe.bg} p-5 sm:p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`text-sm font-semibold px-3 py-1 ${vibe.bg} ${vibe.text} border-0`}>
                  {vibe.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {reportCount} {reportCount === 1 ? "review" : "reviews"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {avgWifi !== null && (
                  <MetricRow label="Avg WiFi" value={`${avgWifi} Mbps`} />
                )}
                {wifiReliablePct !== null && (
                  <MetricRow label="WiFi reliable" value={`${wifiReliablePct}% say yes`} />
                )}
                {commonPower && (
                  <MetricRow label="Power outlets" value={commonPower.charAt(0).toUpperCase() + commonPower.slice(1)} />
                )}
                {commonNoise && (
                  <MetricRow label="Noise level" value={commonNoise.charAt(0).toUpperCase() + commonNoise.slice(1)} />
                )}
                {commonSeating && (
                  <MetricRow label="Seating" value={commonSeating.charAt(0).toUpperCase() + commonSeating.slice(1)} />
                )}
                {longStayPct !== null && (
                  <MetricRow label="Long-stay friendly" value={`${longStayPct}% say yes`} />
                )}
                {commonPrice && (
                  <MetricRow label="Coffee price" value={priceLabels[commonPrice] || commonPrice} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {reportCount > 0 ? "What people say" : "No reviews yet — be the first!"}
            </h2>
            <div className="flex items-center gap-2">
              {reportCount > 1 && (
                <button
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/></svg>
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </button>
              )}
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger render={<Button size="sm" className="gap-1.5 rounded-full" />}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add review
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>How was working from here?</DialogTitle>
                  </DialogHeader>
                  <ReportForm
                    cafeId={cafe.id}
                    cafeName={cafe.name}
                    onSuccess={() => {
                      setReportOpen(false);
                      loadCafe();
                      toast.success("Thanks! Your review is live.");
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {reportCount === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border/60 bg-muted/20">
              <div className="text-3xl mb-3">&#9749;</div>
              <p className="text-muted-foreground mb-1">Share how it is working from here.</p>
              <p className="text-xs text-muted-foreground mb-4">Your experience helps others find great spots.</p>
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger render={<Button className="rounded-full" />}>
                  Share your experience
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>How was working from here?</DialogTitle>
                  </DialogHeader>
                  <ReportForm
                    cafeId={cafe.id}
                    cafeName={cafe.name}
                    onSuccess={() => {
                      setReportOpen(false);
                      loadCafe();
                      toast.success("Thanks! Your review is live.");
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedReports.map((report, i) => (
                <div
                  key={report.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <ReportCard report={report} onDelete={loadCafe} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-border/30">
          <p className="text-[11px] text-muted-foreground">
            Made with &#9749; for Bangalore&apos;s remote workers
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
      <span className="text-sm font-semibold leading-tight">{value}</span>
    </div>
  );
}
