"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { CafeAggregated } from "@/lib/types";
import { CafeCard } from "./CafeCard";

const vibeConfig: Record<string, { color: string; border: string; shadow: string }> = {
  great: { color: "#22c55e", border: "#16a34a", shadow: "rgba(34,197,94,0.4)" },
  okay: { color: "#eab308", border: "#ca8a04", shadow: "rgba(234,179,8,0.4)" },
  not_ideal: { color: "#ef4444", border: "#dc2626", shadow: "rgba(239,68,68,0.4)" },
};

function createCafeIcon(vibe: string, name: string) {
  const config = vibeConfig[vibe] || vibeConfig.not_ideal;
  // Truncate name for label
  const label = name.length > 18 ? name.slice(0, 16) + "…" : name;
  return L.divIcon({
    className: "cafe-marker",
    html: `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="
        width: 36px; height: 36px;
        background: ${config.color};
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 4px;
        box-shadow: 0 3px 8px ${config.shadow}, 0 1px 3px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
        transition: transform 0.2s ease;
        pointer-events: auto;
      "><span style="
        transform: rotate(45deg);
        font-size: 15px;
        line-height: 1;
        filter: grayscale(1) brightness(10);
      ">&#9749;</span></div>
      <span style="
        margin-top: 2px;
        font-size: 10px;
        font-weight: 700;
        font-family: 'Nunito', sans-serif;
        color: #1a1a1a;
        text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white;
        white-space: nowrap;
        pointer-events: auto;
        line-height: 1.2;
      ">${label}</span>
    </div>`,
    iconSize: [36, 48],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
}

interface CafePinProps {
  cafe: CafeAggregated;
  onSelect?: (id: string) => void;
}

export function CafePin({ cafe, onSelect }: CafePinProps) {
  const icon = createCafeIcon(cafe.overall_vibe, cafe.name);

  return (
    <Marker position={[cafe.latitude, cafe.longitude]} icon={icon}>
      <Popup minWidth={260} maxWidth={300} closeButton={false}>
        <CafeCard cafe={cafe} onSelect={onSelect} compact />
      </Popup>
    </Marker>
  );
}
