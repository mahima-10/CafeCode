"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { submitReport } from "@/lib/api";
import { addMyReviewId } from "@/lib/my-reviews";
import { ReportCreate } from "@/lib/types";

const WIFI_PRESETS = [5, 10, 25, 50, 100];

interface ReportFormProps {
  cafeId: string;
  cafeName?: string;
  onSuccess: () => void;
}

export function ReportForm({ cafeId, cafeName, onSuccess }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ReportCreate>({
    wifi_speed_mbps: null,
    wifi_reliable: null,
    power_outlets: null,
    noise_level: null,
    seating_comfort: null,
    long_stay_friendly: null,
    coffee_price_range: null,
    notes: null,
    submitted_by: null,
  });

  function hasAtLeastOneField(): boolean {
    return (
      form.wifi_speed_mbps !== null ||
      form.wifi_reliable !== null ||
      form.power_outlets !== null ||
      form.noise_level !== null ||
      form.seating_comfort !== null ||
      form.long_stay_friendly !== null ||
      form.coffee_price_range !== null ||
      (form.notes != null && form.notes.trim().length > 0)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasAtLeastOneField()) {
      toast.error("Fill in at least one field so your review is useful!");
      return;
    }
    setLoading(true);
    try {
      const report = await submitReport(cafeId, form);
      addMyReviewId(report.id);
      setSubmitted(true);
      // Brief success animation before closing
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch {
      toast.error("Hmm, something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-in-up">
        <div className="text-5xl animate-bounce">&#9749;</div>
        <p className="text-lg font-semibold">Thanks for sharing!</p>
        <p className="text-sm text-muted-foreground">Your review helps fellow remote workers.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {cafeName && (
        <p className="text-sm text-muted-foreground">
          How was working from <span className="font-medium text-foreground">{cafeName}</span>?
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wifi_speed">WiFi speed (Mbps)</Label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {WIFI_PRESETS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setForm({ ...form, wifi_speed_mbps: speed })}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  form.wifi_speed_mbps === speed
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
          <Input
            id="wifi_speed"
            type="number"
            min={0}
            max={500}
            step="1"
            placeholder="or type custom"
            value={form.wifi_speed_mbps ?? ""}
            onChange={(e) =>
              setForm({ ...form, wifi_speed_mbps: e.target.value ? Math.max(0, Number(e.target.value)) : null })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="submitted_by">Your name (optional)</Label>
          <Input
            id="submitted_by"
            placeholder="e.g. arjun"
            onChange={(e) =>
              setForm({ ...form, submitted_by: e.target.value || null })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Switch
            id="wifi_reliable"
            onCheckedChange={(checked) => setForm({ ...form, wifi_reliable: checked })}
          />
          <Label htmlFor="wifi_reliable">Did the WiFi hold up?</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="long_stay"
            onCheckedChange={(checked) => setForm({ ...form, long_stay_friendly: checked })}
          />
          <Label htmlFor="long_stay">Could you sit for 2+ hours?</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label>Power outlets?</Label>
          <Select onValueChange={(v) => setForm({ ...form, power_outlets: (v as string) ?? null })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="few">Few</SelectItem>
              <SelectItem value="plenty">Plenty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How noisy?</Label>
          <Select onValueChange={(v) => setForm({ ...form, noise_level: (v as string) ?? null })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="quiet">Quiet</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="loud">Loud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Seating?</Label>
          <Select onValueChange={(v) => setForm({ ...form, seating_comfort: (v as string) ?? null })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bad">Bad</SelectItem>
              <SelectItem value="okay">Okay</SelectItem>
              <SelectItem value="great">Great</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Coffee prices?</Label>
        <Select onValueChange={(v) => setForm({ ...form, coffee_price_range: (v as string) ?? null })}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">Budget (under ₹150)</SelectItem>
            <SelectItem value="mid">Mid-range (₹150-300)</SelectItem>
            <SelectItem value="premium">Premium (₹300+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Any tips for fellow remote workers?</Label>
        <Textarea
          id="notes"
          placeholder="Best seat is by the window, WiFi password on the counter..."
          onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sharing..." : "Share your experience"}
      </Button>
    </form>
  );
}
