"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Report } from "@/lib/types";
import { deleteReport, flagReport } from "@/lib/api";
import { isMyReview, removeMyReviewId } from "@/lib/my-reviews";
import { timeAgo } from "@/lib/time";
import { toast } from "sonner";

const priceLabels: Record<string, string> = {
  budget: "under ₹150",
  mid: "₹150-300",
  premium: "₹300+",
};

interface ReportCardProps {
  report: Report;
  onDelete?: () => void;
}

export function ReportCard({ report, onDelete }: ReportCardProps) {
  const [flagging, setFlagging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isMine = isMyReview(report.id);

  const relativeTime = timeAgo(report.created_at);

  const tags: { label: string; variant?: "good" | "neutral" | "bad" }[] = [];
  if (report.wifi_speed_mbps !== null) {
    const s = report.wifi_speed_mbps;
    tags.push({ label: `${s} Mbps`, variant: s >= 20 ? "good" : s >= 10 ? "neutral" : "bad" });
  }
  if (report.wifi_reliable !== null) {
    tags.push({ label: report.wifi_reliable ? "Reliable WiFi" : "Spotty WiFi", variant: report.wifi_reliable ? "good" : "bad" });
  }
  if (report.power_outlets) {
    const v = report.power_outlets;
    tags.push({ label: v === "plenty" ? "Plenty of outlets" : v === "few" ? "Few outlets" : "No outlets", variant: v === "plenty" ? "good" : v === "none" ? "bad" : "neutral" });
  }
  if (report.noise_level) {
    const v = report.noise_level;
    tags.push({ label: v.charAt(0).toUpperCase() + v.slice(1), variant: v === "quiet" ? "good" : v === "moderate" ? "neutral" : "bad" });
  }
  if (report.seating_comfort) {
    const v = report.seating_comfort;
    tags.push({ label: `${v.charAt(0).toUpperCase() + v.slice(1)} seating` });
  }
  if (report.long_stay_friendly !== null) {
    tags.push({ label: report.long_stay_friendly ? "Long-stay OK" : "Quick visits", variant: report.long_stay_friendly ? "good" : "neutral" });
  }
  if (report.coffee_price_range) {
    tags.push({ label: priceLabels[report.coffee_price_range] || report.coffee_price_range });
  }

  async function handleDelete() {
    setDeleting(true);
    setConfirmOpen(false);
    try {
      await deleteReport(report.id);
      removeMyReviewId(report.id);
      toast.success("Review deleted.");
      onDelete?.();
    } catch {
      toast.error("Couldn't delete. Try again?");
    } finally {
      setDeleting(false);
    }
  }

  async function handleFlag() {
    setFlagging(true);
    try {
      await flagReport(report.id);
      setFlagged(true);
      toast.success("Flagged. We'll review it.");
    } catch {
      toast.error("Couldn't flag. Try again?");
    } finally {
      setFlagging(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-border/50">
        <CardContent className="pt-4 pb-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {(report.submitted_by || "A")[0].toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-medium">
                  {report.submitted_by || "Anonymous"}
                </span>
                {isMine && (
                  <span className="ml-1.5 text-[10px] text-primary font-medium">You</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{relativeTime}</span>
              {isMine ? (
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                  className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete your review"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              ) : (
                <button
                  onClick={handleFlag}
                  disabled={flagging || flagged}
                  className={`text-[11px] transition-colors ${flagged ? "text-muted-foreground/40" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label={flagged ? "Already flagged" : "Flag this review"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                </button>
              )}
            </div>
          </div>

          {tags.length > 0 && (
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
          )}

          {report.notes && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-sm leading-relaxed italic text-foreground/80">
                &ldquo;{report.notes}&rdquo;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete your review?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This can&apos;t be undone.</p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
