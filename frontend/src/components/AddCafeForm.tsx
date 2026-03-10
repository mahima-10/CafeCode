"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCafe } from "@/lib/api";

const PinDropMap = dynamic(
  () => import("@/components/PinDropMap").then((m) => ({ default: m.PinDropMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

const BANGALORE_AREAS = [
  "Koramangala", "Indiranagar", "HSR Layout", "BTM Layout", "JP Nagar",
  "Jayanagar", "Whitefield", "MG Road", "Church Street", "Malleshwaram",
  "Rajajinagar", "Marathahalli", "Sarjapur Road", "Electronic City",
  "Bannerghatta Road", "Hebbal", "Yelahanka", "Basavanagudi", "Frazer Town",
  "Domlur", "Sadashivanagar", "Ulsoor", "Richmond Town", "Lavelle Road",
];

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    suburb?: string;
    neighbourhood?: string;
    locality?: string;
    district?: string;
    city?: string;
    county?: string;
    osm_key?: string;
    osm_value?: string;
  };
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    road?: string;
  };
}

function detectArea(result: SearchResult): string {
  // Check everything: name, display_name, and address fields
  const allText = [
    result.name,
    result.display_name,
    result.address?.suburb,
    result.address?.neighbourhood,
    result.address?.city_district,
    result.address?.road,
  ].filter(Boolean).join(" ").toLowerCase();

  for (const area of BANGALORE_AREAS) {
    if (allText.includes(area.toLowerCase())) return area;
  }
  return result.address?.suburb || result.address?.neighbourhood || "Other";
}

// Reverse geocode to detect area from coords
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "User-Agent": "CafeCode/1.0" } }
    );
    const data = await res.json();
    if (data.address) {
      const location = [data.address.suburb, data.address.neighbourhood, data.address.city_district]
        .filter(Boolean).join(" ");
      for (const area of BANGALORE_AREAS) {
        if (location.toLowerCase().includes(area.toLowerCase())) return area;
      }
      return data.address.suburb || data.address.neighbourhood || "Other";
    }
  } catch { /* ignore */ }
  return "Other";
}

interface AddCafeFormProps {
  onSuccess: () => void;
}

export function AddCafeForm({ onSuccess }: AddCafeFormProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"search" | "pin">("search");
  const [mapKey, setMapKey] = useState(0);

  // Shared state
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Search mode state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Nominatim search
  useEffect(() => {
    if (selected || mode !== "search") return;
    if (query.length < 3) { setResults([]); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Use Photon (komoot) — much better at finding businesses/POIs
        const params = new URLSearchParams({
          q: query,
          lat: "12.9716",
          lon: "77.5946",
          limit: "6",
          lang: "en",
        });
        const res = await fetch(`https://photon.komoot.io/api/?${params}`);
        const data = await res.json();
        const features = (data.features || []) as PhotonFeature[];

        // Filter to roughly Bangalore area and convert to our format
        const blrResults: SearchResult[] = features
          .filter((f) => {
            const [lon, lat] = f.geometry.coordinates;
            return lat > 12.7 && lat < 13.2 && lon > 77.3 && lon < 77.9;
          })
          .map((f) => ({
            display_name: [f.properties.name, f.properties.street, f.properties.locality, f.properties.suburb, f.properties.district].filter(Boolean).join(", "),
            lat: String(f.geometry.coordinates[1]),
            lon: String(f.geometry.coordinates[0]),
            name: f.properties.name,
            address: {
              suburb: f.properties.suburb || f.properties.locality,
              neighbourhood: f.properties.neighbourhood || f.properties.locality,
              city_district: f.properties.district,
              road: f.properties.street,
            },
          }));

        setResults(blrResults);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selected, mode]);

  function handleSearchSelect(result: SearchResult) {
    const cleanName = result.name || result.display_name.split(",")[0];
    setName(cleanName);
    setQuery(cleanName);
    setLatitude(parseFloat(result.lat));
    setLongitude(parseFloat(result.lon));
    setArea(detectArea(result));
    setSelected(true);
    setResults([]);
  }

  function handleSearchClear() {
    setSelected(false);
    setName(""); setQuery(""); setArea("");
    setLatitude(null); setLongitude(null);
    setResults([]);
  }

  async function handlePinChange(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    const detected = await reverseGeocode(lat, lng);
    setArea(detected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !latitude || !longitude) {
      toast.error(mode === "search" ? "Search for and select a cafe first." : "Drop a pin and enter the cafe name.");
      return;
    }
    setLoading(true);
    try {
      await createCafe({
        name,
        area: area || "Other",
        latitude,
        longitude,
      });
      onSuccess();
    } catch {
      toast.error("Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      <div className="flex border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("search")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${mode === "search" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Search by name
        </button>
        <button
          type="button"
          onClick={() => { setMode("pin"); setMapKey((k) => k + 1); }}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${mode === "pin" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Drop a pin
        </button>
      </div>

      {mode === "search" ? (
        <>
          {/* Search input */}
          <div className="space-y-2">
            <Label>Search for the cafe</Label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <Input
                placeholder='e.g. "Third Wave Jayanagar"'
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (selected) { setSelected(false); setName(""); } }}
                className="pl-9 pr-8"
              />
              {query && (
                <button type="button" onClick={handleSearchClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {!selected && results.length > 0 && (
              <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                {results.map((r, i) => (
                  <button key={i} type="button" onClick={() => handleSearchSelect(r)} className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors border-b last:border-b-0 border-border/30">
                    <p className="text-sm font-medium leading-tight">{r.name || r.display_name.split(",")[0]}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{r.display_name}</p>
                  </button>
                ))}
              </div>
            )}
            {!selected && searching && <p className="text-xs text-muted-foreground">Searching...</p>}
            {!selected && query.length >= 3 && !searching && results.length === 0 && (
              <p className="text-xs text-muted-foreground">No results found. Try the pin drop tab instead.</p>
            )}
          </div>

          {/* Selected details */}
          {selected && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="cafe_name">Cafe name</Label>
                <Input id="cafe_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Edit if needed" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Area</span>
                <span className="font-medium">{area || "Other"}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Pin drop mode */}
          <div className="space-y-2">
            <Label htmlFor="pin_cafe_name">Cafe name</Label>
            <Input
              id="pin_cafe_name"
              placeholder="e.g. Third Wave Coffee, Koramangala"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tap the map to drop a pin</Label>
            <div className="h-[200px] rounded-lg overflow-hidden border">
              <PinDropMap
                key={mapKey}
                latitude={latitude}
                longitude={longitude}
                onChange={handlePinChange}
              />
            </div>
            {latitude && longitude ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
                {area && <p className="text-xs font-medium">{area}</p>}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Tap anywhere on the map to set the location</p>
            )}
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={loading || !name || !latitude}>
        {loading ? "Adding..." : "Add this spot"}
      </Button>
    </form>
  );
}
