"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { BungalowMarker } from "./InteractiveMap";
import { useState, useMemo, useRef, useEffect } from "react";
import TripPlannerModal from "./TripPlannerModal";

// Dynamically import the Leaflet map so it only renders on the client
// This prevents "window is not defined" errors during SSR
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">map</span>
        <h2 className="text-lg font-bold text-slate-800">Loading Map...</h2>
      </div>
    </div>
  ),
});

export type Attraction = {
  id: number;
  title: string;
  lat: number;
  lon: number;
  thumbnail?: string;
  extract?: string;
  distanceKm?: number;
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export default function MapWrapper({ bungalows }: { bungalows: BungalowMarker[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [selectedArea, setSelectedArea] = useState<string>("All");

  const [selectedBungalow, setSelectedBungalow] = useState<BungalowMarker | null>(null);
  const [nearbyAttractions, setNearbyAttractions] = useState<Attraction[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const attractionsScrollRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (attractionsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = attractionsScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const timer = setTimeout(checkScrollPosition, 100);
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [nearbyAttractions]);

  const handleScrollLeft = () => {
    if (attractionsScrollRef.current) {
      attractionsScrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (attractionsScrollRef.current) {
      attractionsScrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  // Standard 25 Districts of Sri Lanka for Area Filtering
  const uniqueAreas = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const fetchNearbyAttractions = async (bungalow: BungalowMarker) => {
    setSelectedBungalow(bungalow);
    setSelectedAttraction(null);
    setIsLoadingAttractions(true);
    setNearbyAttractions([]);

    try {
      // We are using Wikipedia Geosearch API because public Overpass API is rate-limited and throws 504 timeouts.
      // Wikipedia is 100% reliable for hackathon demos.
      const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${bungalow.latitude}|${bungalow.longitude}&gsradius=10000&gslimit=50&format=json&origin=*`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      const allPlaces = geoData.query?.geosearch || [];
      // Filter out non-tourist mundane places to improve accuracy
      const excludeKeywords = ['school', 'college', 'university', 'vidyalaya', 'hospital', 'clinic', 'medical', 'camp', 'station', 'office'];
      let places = allPlaces.filter((p: any) => {
        const title = p.title.toLowerCase();
        return !excludeKeywords.some(keyword => title.includes(keyword));
      });

      if (places.length === 0) {
        // Fallback: search wider radius (25km = 25000) for remote bungalows
        const fallbackUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${bungalow.latitude}|${bungalow.longitude}&gsradius=25000&gslimit=50&format=json&origin=*`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        const fallbackPlaces = fallbackData.query?.geosearch || [];
        places = fallbackPlaces.filter((p: any) => {
          const title = p.title.toLowerCase();
          return !excludeKeywords.some(keyword => title.includes(keyword));
        });
      }

      if (places.length === 0) {
        setIsLoadingAttractions(false);
        return;
      }

      const topPlaces = places.slice(0, 15);
      const pageIds = topPlaces.map((p: any) => p.pageid).join('|');

      const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=200&exsentences=2&explaintext=true&pageids=${pageIds}&format=json&origin=*`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      const pages = detailsData.query?.pages || {};

      const attractions: Attraction[] = topPlaces.map((p: any) => {
        const page = pages[p.pageid];
        const distanceKm = getDistanceFromLatLonInKm(bungalow.latitude!, bungalow.longitude!, p.lat, p.lon);
        return {
          id: p.pageid,
          title: p.title,
          lat: p.lat,
          lon: p.lon,
          thumbnail: page?.thumbnail?.source,
          extract: page?.extract,
          distanceKm,
        };
      }).sort((a: Attraction, b: Attraction) => (a.distanceKm || 0) - (b.distanceKm || 0));

      setNearbyAttractions(attractions);
    } catch (error) {
      console.error("Error fetching Overpass attractions:", error);
    } finally {
      setIsLoadingAttractions(false);
    }
  };

  const handleAttractionClick = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
  };

  // Client-side filtering
  const filteredBungalows = useMemo(() => {
    return bungalows.filter((b) => {
      // 1. Search Query
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Price Filter
      const matchesPrice = b.price <= maxPrice;

      // 3. Area Filter
      const matchesArea = selectedArea === "All" || b.location.includes(selectedArea);

      return matchesSearch && matchesPrice && matchesArea;
    });
  }, [bungalows, searchQuery, maxPrice, selectedArea]);

  return (
    <>
      {/* Map Header / Filters - Top Right */}
      <div className="absolute top-6 right-6 z-10 flex gap-4 pointer-events-none justify-end">

        {/* Search Box with Live Dropdown */}
        <div className="relative pointer-events-auto w-96">
          <div className="bg-white p-3 rounded-md shadow-lg border border-slate-200 flex items-center gap-3 w-full transition-all focus-within:ring-2 focus-within:ring-brand-primary">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search bungalow name (e.g. Visumpaya) or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full focus:outline-none text-slate-800 placeholder-slate-400 text-sm bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-md shadow-md border border-slate-200 max-h-72 overflow-y-auto z-30 p-2">
              {filteredBungalows.length > 0 ? (
                filteredBungalows.map((bungalow) => (
                  <button
                    key={bungalow.id}
                    onClick={() => {
                      fetchNearbyAttractions(bungalow);
                      setShowSearchDropdown(false);
                      setSearchQuery(bungalow.name);
                    }}
                    className="w-full text-left p-3 rounded-md hover:bg-brand-primary/5 flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <img src={bungalow.image} alt={bungalow.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-brand-primary truncate">{bungalow.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{bungalow.location}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-brand-primary text-lg">chevron_right</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 font-medium">
                  No bungalows matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters Button */}
        <div className="flex gap-2 pointer-events-auto relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 bg-white border border-slate-200 shadow-lg rounded-md text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${showFilters ? 'text-brand-primary ring-2 ring-brand-primary' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'}`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
          </button>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="absolute top-full mt-3 right-0 w-72 bg-white p-5 rounded-md shadow-md border border-slate-200 z-20">

              {/* Area Filter */}
              <div className="mb-5">
                <h3 className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-brand-primary">location_on</span>
                  Filter by Area
                </h3>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-brand-primary focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
                >
                  <option value="All">All Regions</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-brand-primary">payments</span>
                  Max Price (Rs. {maxPrice.toLocaleString()})
                </h3>
                <input
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full mb-2 accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Rs. 500</span>
                  <span>Rs. 30,000+</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Selected Bungalow & Nearby Attractions Overlay */}
      {selectedBungalow && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto flex flex-col items-center gap-3 max-w-4xl w-full px-4">
          <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 w-full">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-800 truncate mb-1">{selectedBungalow.name}</h2>
              <p className="flex items-center text-slate-500 font-medium text-xs mb-3"><span className="material-symbols-outlined text-sm mr-1 text-primary">location_on</span>{selectedBungalow.location}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setIsPlannerOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-sm shadow-md transition-all hover:shadow-lg active:scale-95 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Plan Trip with AI
              </button>
              <Link
                href={`/browse/${selectedBungalow.slug}`}
                className="px-5 py-2.5 bg-[#D0D34D] hover:bg-[#b8bb3d] text-[#21263A] text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Book Bungalow</span>
                <span className="material-symbols-outlined text-[16px] text-[#21263A]">arrow_forward</span>
              </Link>
              <button
                onClick={() => {
                  setSelectedBungalow(null);
                  setSelectedAttraction(null);
                  setNearbyAttractions([]);
                }}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-md cursor-pointer transition-colors"
                title="Clear selection"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Interactive Attraction Cards List (Omits the "Found 10 attractions near" text) */}
          {!isLoadingAttractions && nearbyAttractions.length > 0 && (
            <div className="w-full flex items-center gap-2 relative">
              {canScrollLeft && (
                <button
                  onClick={handleScrollLeft}
                  className="w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-purple-600 rounded-full shadow-lg border border-slate-200 cursor-pointer shrink-0 transition-all active:scale-95 animate-fade-in"
                  title="Scroll Left"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
              )}

              <div
                ref={attractionsScrollRef}
                onScroll={checkScrollPosition}
                className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-2 no-scrollbar scroll-smooth"
              >
                {nearbyAttractions.map((attraction) => {
                  const isSelected = selectedAttraction?.id === attraction.id;
                  return (
                    <button
                      key={attraction.id}
                      onClick={() => handleAttractionClick(attraction)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold shadow-lg transition-all shrink-0 border cursor-pointer ${isSelected
                          ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400 scale-105"
                          : "bg-white/95 backdrop-blur-md text-purple-950 border-purple-100 hover:bg-purple-50 hover:border-purple-300"
                        }`}
                      title={`Click to zoom in on ${attraction.title}`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-500">
                        {isSelected ? "zoom_in" : "location_on"}
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="truncate max-w-[150px]">{attraction.title}</span>
                        {attraction.distanceKm !== undefined && (
                          <span className={`text-[10px] font-medium leading-none mt-0.5 ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                            {attraction.distanceKm.toFixed(1)} km away
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {canScrollRight && (
                <button
                  onClick={handleScrollRight}
                  className="w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-purple-600 rounded-full shadow-lg border border-slate-200 cursor-pointer shrink-0 transition-all active:scale-95 animate-fade-in"
                  title="Scroll Right"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trip Planner Modal */}
      {selectedBungalow && isPlannerOpen && (
        <TripPlannerModal
          isOpen={isPlannerOpen}
          onClose={() => setIsPlannerOpen(false)}
          bungalowName={selectedBungalow.name}
          bungalowArea={selectedBungalow.location}
          attractions={nearbyAttractions}
        />
      )}

      <InteractiveMap
        bungalows={filteredBungalows}
        onBungalowClick={fetchNearbyAttractions}
        attractions={nearbyAttractions}
        selectedBungalow={selectedBungalow}
        selectedAttraction={selectedAttraction}
        onAttractionClick={handleAttractionClick}
      />
    </>
  );
}
