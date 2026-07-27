"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Fix Leaflet's default icon path issues in Next.js/Webpack
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export type BungalowMarker = {
  id: string;
  name: string;
  slug: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  image: string;
  department: string;
};

import { useRouter } from "next/navigation";

// Component to recenter map when active marker changes (optional enhancement)
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), {
      animate: true,
    });
  }, [lat, lng, map]);
  return null;
}

export default function InteractiveMap({ bungalows }: { bungalows: BungalowMarker[] }) {
  const [activeBungalow, setActiveBungalow] = useState<BungalowMarker | null>(null);
  const router = useRouter();

  // Filter out bungalows without valid coordinates
  const validBungalows = bungalows.filter((b) => b.latitude !== null && b.longitude !== null);

  // Center and Bounds for Sri Lanka
  const defaultCenter: [number, number] = [7.8731, 80.7718];
  const slBounds: L.LatLngBoundsExpression = [
    [5.9, 79.5], // South West
    [9.9, 82.0], // North East
  ];

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={7} 
        minZoom={7}
        maxBounds={slBounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {validBungalows.map((bungalow) => (
          <Marker 
            key={bungalow.id} 
            position={[bungalow.latitude!, bungalow.longitude!]}
            eventHandlers={{
              click: () => {
                router.push(`/browse/${bungalow.slug}`);
              },
            }}
          >
            <Tooltip 
              direction="auto" 
              offset={[0, -20]} 
              opacity={1} 
              className="custom-popup bg-transparent border-0 shadow-none p-0"
            >
              <div className="w-56 p-1 bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-none overflow-hidden">
                <div className="w-full h-32 overflow-hidden mb-3">
                  <img src={bungalow.image} alt={bungalow.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 leading-tight mb-1 px-1">{bungalow.name}</h3>
                <p className="text-xs text-slate-500 mb-2 truncate px-1">{bungalow.location}</p>
                <div className="flex justify-between items-end mb-1 px-1">
                  <p className="font-bold text-blue-600 text-sm">Rs. {bungalow.price.toLocaleString()}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                    Available
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2 mb-1 font-medium px-1">Click pin to view details</p>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
