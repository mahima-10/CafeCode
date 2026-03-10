"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    width: 32px; height: 32px;
    background: #ef4444;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const BANGALORE_CENTER: [number, number] = [12.9516, 77.6386];

interface PinDropMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(
        Math.round(e.latlng.lat * 10000) / 10000,
        Math.round(e.latlng.lng * 10000) / 10000
      );
    },
  });
  return null;
}

function LocateButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        onLocate(lat, lng);
        map.flyTo([lat, lng], 16, { duration: 1 });
        setLocating(false);
      },
      () => {
        alert("Could not get your location. Please drop a pin manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: "auto" }}>
      <div className="leaflet-control">
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          style={{
            background: "white",
            border: "2px solid rgba(0,0,0,0.2)",
            borderRadius: "4px",
            padding: "6px 10px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: locating ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "10px",
            marginRight: "10px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          {locating ? "Finding..." : "Use my location"}
        </button>
      </div>
    </div>
  );
}

export function PinDropMap({ latitude, longitude, onChange }: PinDropMapProps) {
  return (
    <MapContainer
      center={latitude && longitude ? [latitude, longitude] : BANGALORE_CENTER}
      zoom={12}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "200px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ClickHandler onChange={onChange} />
      <LocateButton onLocate={onChange} />
      {latitude && longitude && (
        <Marker position={[latitude, longitude]} icon={pinIcon} />
      )}
    </MapContainer>
  );
}
