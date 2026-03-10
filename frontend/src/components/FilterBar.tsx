"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fetchAreas } from "@/lib/api";

export interface Filters {
  area?: string;
  power_outlets?: string;
  noise_level?: string;
  long_stay_friendly?: boolean;
  [key: string]: string | boolean | undefined;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [areas, setAreas] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAreas().then(setAreas).catch(() => {});
  }, []);

  function clearFilters() {
    onChange({});
  }

  const hasFilters = Object.values(filters).some((v) => v !== undefined);
  const activeCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" /><line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" /><line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" /><line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 flex flex-wrap items-end gap-2 sm:gap-3 animate-in slide-in-from-top-1 duration-200">
          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs text-muted-foreground">Area</Label>
            <Select
              value={filters.area || "all"}
              onValueChange={(v) => onChange({ ...filters, area: !v || v === "all" ? undefined : v as string })}
            >
              <SelectTrigger className="w-[120px] sm:w-[160px] h-8 sm:h-9 text-xs">
                <SelectValue placeholder="All areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs text-muted-foreground">Outlets</Label>
            <Select
              value={filters.power_outlets || "any"}
              onValueChange={(v) => onChange({ ...filters, power_outlets: !v || v === "any" ? undefined : v as string })}
            >
              <SelectTrigger className="w-[100px] sm:w-[130px] h-8 sm:h-9 text-xs">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="plenty">Plenty</SelectItem>
                <SelectItem value="few">Few</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] sm:text-xs text-muted-foreground">Noise</Label>
            <Select
              value={filters.noise_level || "any"}
              onValueChange={(v) => onChange({ ...filters, noise_level: !v || v === "any" ? undefined : v as string })}
            >
              <SelectTrigger className="w-[100px] sm:w-[130px] h-8 sm:h-9 text-xs">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="quiet">Quiet</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="loud">Loud</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pb-0.5">
            <Switch
              id="long_stay_filter"
              checked={filters.long_stay_friendly || false}
              onCheckedChange={(checked) =>
                onChange({ ...filters, long_stay_friendly: checked || undefined })
              }
            />
            <Label htmlFor="long_stay_filter" className="text-[10px] sm:text-xs whitespace-nowrap">
              Long-stay
            </Label>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 sm:h-9 text-xs">
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
