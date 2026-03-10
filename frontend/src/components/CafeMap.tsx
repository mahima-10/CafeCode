"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CafeAggregated } from "@/lib/types";
import { CafePin } from "./CafePin";

// Fix default marker icon issue with webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Bangalore center
const BANGALORE_CENTER: [number, number] = [12.9516, 77.6386];
const DEFAULT_ZOOM = 12;

function FitBounds({ cafes }: { cafes: CafeAggregated[] }) {
  const map = useMap();
  const prevCountRef = useRef(cafes.length);

  useEffect(() => {
    if (cafes.length === 0) return;
    // Always fit on first load; after that only re-fit when the set changes (search/filter)
    if (cafes.length === 1) {
      map.flyTo([cafes[0].latitude, cafes[0].longitude], 15, { duration: 0.5 });
    } else {
      const bounds = L.latLngBounds(cafes.map((c) => [c.latitude, c.longitude]));
      if (prevCountRef.current !== cafes.length) {
        map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 0.5 });
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
    prevCountRef.current = cafes.length;
  }, [cafes, map]);

  return null;
}

function LocateControl() {
  const map = useMap();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(latlng);
        map.flyTo(latlng, 15, { duration: 1 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  return (
    <>
      <div
        className="leaflet-bottom leaflet-right"
        style={{ pointerEvents: "auto", marginBottom: "24px", marginRight: "10px" }}
      >
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          title="Find my location"
          style={{
            width: "44px",
            height: "44px",
            background: "white",
            border: "none",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            cursor: locating ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={locating ? "#999" : "#333"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
      </div>
      {userPos && (
        <CircleMarker
          center={userPos}
          radius={8}
          pathOptions={{
            color: "white",
            weight: 3,
            fillColor: "#3b82f6",
            fillOpacity: 1,
          }}
        />
      )}
    </>
  );
}

interface CafeMapProps {
  cafes: CafeAggregated[];
  onSelectCafe?: (id: string) => void;
}

export function CafeMap({ cafes, onSelectCafe }: CafeMapProps) {
  return (
    <MapContainer
      center={BANGALORE_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {cafes.map((cafe) => (
        <CafePin key={cafe.id} cafe={cafe} onSelect={onSelectCafe} />
      ))}
      <FitBounds cafes={cafes} />
      <LocateControl />
    </MapContainer>
  );
}
