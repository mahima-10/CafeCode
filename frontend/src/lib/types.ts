export interface Cafe {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  google_maps_link: string | null;
  created_at: string;
}

export interface CafeAggregated extends Cafe {
  avg_wifi_speed: number | null;
  wifi_reliable_pct: number | null;
  most_common_power_outlets: string | null;
  most_common_noise_level: string | null;
  most_common_seating_comfort: string | null;
  long_stay_friendly_pct: number | null;
  most_common_price_range: string | null;
  report_count: number;
  overall_vibe: "great" | "okay" | "not_ideal";
}

export interface Report {
  id: string;
  cafe_id: string;
  wifi_speed_mbps: number | null;
  wifi_reliable: boolean | null;
  power_outlets: string | null;
  noise_level: string | null;
  seating_comfort: string | null;
  long_stay_friendly: boolean | null;
  coffee_price_range: string | null;
  notes: string | null;
  submitted_by: string | null;
  flag_count: number;
  created_at: string;
}

export interface CafeDetail extends Cafe {
  reports: Report[];
}

export interface ReportCreate {
  wifi_speed_mbps?: number | null;
  wifi_reliable?: boolean | null;
  power_outlets?: string | null;
  noise_level?: string | null;
  seating_comfort?: string | null;
  long_stay_friendly?: boolean | null;
  coffee_price_range?: string | null;
  notes?: string | null;
  submitted_by?: string | null;
}

export interface CafeCreate {
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  google_maps_link?: string | null;
}
