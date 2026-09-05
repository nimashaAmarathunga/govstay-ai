import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { Attraction } from "./MapWrapper";

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

// Component to recenter map smoothly when active marker/attraction changes
function RecenterMap({ lat, lng, zoom = 13 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2,
    });
  }, [lat, lng, zoom, map]);
  return null;
}

const AttractionIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ActiveAttractionIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function InteractiveMap({
  bungalows,
  onBungalowClick,
  attractions = [],
  selectedBungalow,
  selectedAttraction,
  onAttractionClick,
}: {
  bungalows: BungalowMarker[];
  onBungalowClick?: (b: BungalowMarker) => void;
  attractions?: Attraction[];
  selectedBungalow?: BungalowMarker | null;
  selectedAttraction?: Attraction | null;
  onAttractionClick?: (attraction: Attraction) => void;
}) {
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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Zooming and Recentering */}
        {selectedAttraction ? (
          <RecenterMap lat={selectedAttraction.lat} lng={selectedAttraction.lon} zoom={15} />
        ) : (
          selectedBungalow && selectedBungalow.latitude && selectedBungalow.longitude && (
            <RecenterMap lat={selectedBungalow.latitude} lng={selectedBungalow.longitude} zoom={13} />
          )
        )}

        {validBungalows.map((bungalow) => (
          <Marker
            key={bungalow.id}
            position={[bungalow.latitude!, bungalow.longitude!]}
            eventHandlers={{
              click: () => {
                if (onBungalowClick) {
                  onBungalowClick(bungalow);
                } else {
                  router.push(`/browse/${bungalow.slug}`);
                }
              },
            }}
          >
            <Tooltip
              direction="auto"
              offset={[0, -20]}
              opacity={1}
              className="custom-popup bg-transparent border-0 shadow-none p-0"
            >
              <div className="w-56 p-1 bg-white rounded-md shadow-md border border-slate-200 pointer-events-none overflow-hidden">
                <div className="w-full h-32 overflow-hidden mb-3">
                  <img src={bungalow.image} alt={bungalow.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 leading-tight mb-1 px-1">{bungalow.name}</h3>
                <p className="text-xs text-slate-500 mb-2 truncate px-1">{bungalow.location}</p>
                <div className="flex justify-between items-end mb-1 px-1">
                  <p className="font-bold text-brand-primary text-sm">from Rs. {bungalow.price.toLocaleString()}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                    Available
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2 mb-1 font-medium px-1">Click pin to explore nearby</p>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {attractions.map((attraction) => {
          const isSelected = selectedAttraction?.id === attraction.id;
          return (
            <Marker
              key={`attr-${attraction.id}`}
              position={[attraction.lat, attraction.lon]}
              icon={isSelected ? ActiveAttractionIcon : AttractionIcon}
              zIndexOffset={isSelected ? 1000 : 500}
              eventHandlers={{
                click: () => {
                  if (onAttractionClick) {
                    onAttractionClick(attraction);
                  }
                },
              }}
            >
              <Tooltip
                permanent
                direction="bottom"
                className={`glass-tooltip !bg-white/90 !border ${isSelected ? '!border-amber-500 !text-amber-900 font-extrabold scale-110' : '!border-white/20 !text-purple-900 font-bold'} text-[10px] px-2 py-0.5 !rounded-md backdrop-blur-md mt-1 shadow-md transition-all`}
                opacity={1}
              >
                <span className="drop-shadow-sm">{attraction.title}</span>
              </Tooltip>
              <Popup
                offset={[0, -20]}
                className="custom-popup border-0 shadow-none p-0"
              >
                <div className="w-56 p-1 bg-white rounded-md shadow-md border border-slate-200 overflow-hidden m-0">
                  {attraction.thumbnail && (
                    <div className="w-full h-24 overflow-hidden mb-2">
                      <img src={attraction.thumbnail} alt={attraction.title} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  )}
                  <h3 className="font-bold text-sm text-purple-700 leading-tight mb-1 px-1">{attraction.title}</h3>
                  {attraction.extract && (
                    <p className="text-[11px] text-slate-600 mb-2 px-1 line-clamp-3 leading-snug">{attraction.extract}</p>
                  )}
                  <p className="text-[9px] text-slate-400 px-1 italic">Source: Wikipedia</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
