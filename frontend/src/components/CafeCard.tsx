"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CafeAggregated } from "@/lib/types";

const vibeBadge: Record<string, { label: string; className: string; accent: string }> = {
  great: {
    label: "Great for WFC",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300",
    accent: "from-green-500 to-green-400",
  },
  okay: {
    label: "Okay for WFC",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300",
    accent: "from-yellow-500 to-yellow-400",
  },
  not_ideal: {
    label: "Skip",
    className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300",
    accent: "from-red-500 to-red-400",
  },
};

const priceLabels: Record<string, string> = {
  budget: "₹80-150",
  mid: "₹150-300",
  premium: "₹300+",
};

function buildTags(cafe: CafeAggregated) {
  const tags: { label: string; variant?: "good" | "neutral" | "bad" }[] = [];
  if (cafe.avg_wifi_speed !== null) {
    const s = cafe.avg_wifi_speed;
    tags.push({ label: `${s} Mbps`, variant: s >= 20 ? "good" : s >= 10 ? "neutral" : "bad" });
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
  return tags;
}

function TagPills({ tags }: { tags: { label: string; variant?: "good" | "neutral" | "bad" }[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, i) => (
        <span
          key={i}
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
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

interface CafeCardProps {
  cafe: CafeAggregated;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

export function CafeCard({ cafe, onSelect, compact = false }: CafeCardProps) {
  const vibe = vibeBadge[cafe.overall_vibe] || vibeBadge.not_ideal;
  const tags = buildTags(cafe);

  if (compact) {
    return (
      <div className="min-w-0 overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${vibe.accent}`} />

        <div className="p-3.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight">{cafe.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{cafe.area}</p>
            </div>
            <Badge className={`shrink-0 text-[10px] ${vibe.className}`}>{vibe.label}</Badge>
          </div>

          <TagPills tags={tags} />

          <div className="flex items-center justify-between pt-1">
            {cafe.long_stay_friendly_pct !== null && (
              <span className={`text-[10px] font-medium ${cafe.long_stay_friendly_pct >= 50 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                {cafe.long_stay_friendly_pct >= 50 ? "Can sit for hours" : "Quick visits"}
              </span>
            )}
            <Link
              href={`/cafe/${cafe.id}`}
              className="text-[11px] font-semibold text-primary hover:underline ml-auto"
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(cafe.id);
                }
              }}
            >
              See details &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-base leading-tight">{cafe.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{cafe.area}</p>
        </div>
        <Badge className={`shrink-0 text-[10px] font-semibold ${vibe.className}`}>{vibe.label}</Badge>
      </div>

      <TagPills tags={tags} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cafe.long_stay_friendly_pct !== null && (
            <span className={`text-xs font-medium ${cafe.long_stay_friendly_pct >= 50 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
              {cafe.long_stay_friendly_pct >= 50 ? "Can sit for hours" : "Quick visits only"}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {cafe.report_count} {cafe.report_count === 1 ? "review" : "reviews"}
        </span>
      </div>
    </div>
  );
}
