import { CafeAggregated, CafeCreate, CafeDetail, ReportCreate, Report } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005/api";

export async function fetchCafes(filters?: {
  area?: string;
  min_wifi_speed?: number;
  power_outlets?: string;
  noise_level?: string;
  long_stay_friendly?: boolean;
}): Promise<CafeAggregated[]> {
  const params = new URLSearchParams();
  if (filters?.area) params.set("area", filters.area);
  if (filters?.min_wifi_speed) params.set("min_wifi_speed", String(filters.min_wifi_speed));
  if (filters?.power_outlets) params.set("power_outlets", filters.power_outlets);
  if (filters?.noise_level) params.set("noise_level", filters.noise_level);
  if (filters?.long_stay_friendly !== undefined) params.set("long_stay_friendly", String(filters.long_stay_friendly));

  const url = `${API_BASE}/cafes${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch cafes");
  return res.json();
}

export async function fetchCafe(id: string): Promise<CafeDetail> {
  const res = await fetch(`${API_BASE}/cafes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch cafe");
  return res.json();
}

export async function createCafe(data: CafeCreate): Promise<CafeAggregated> {
  const res = await fetch(`${API_BASE}/cafes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create cafe");
  return res.json();
}

export async function submitReport(cafeId: string, data: ReportCreate): Promise<Report> {
  const res = await fetch(`${API_BASE}/cafes/${cafeId}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit report");
  return res.json();
}

export async function deleteReport(reportId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete report");
}

export async function flagReport(reportId: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/flag`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to flag report");
  return res.json();
}

export async function fetchAreas(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/areas`);
  if (!res.ok) throw new Error("Failed to fetch areas");
  return res.json();
}
