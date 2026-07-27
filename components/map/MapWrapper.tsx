"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { BungalowMarker } from "./InteractiveMap";

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

import { useState, useMemo } from "react";

export type Attraction = {
  id: number;
  title: string;
  lat: number;
  lon: number;
  thumbnail?: string;
  extract?: string;
};

export default function MapWrapper({ bungalows }: { bungalows: BungalowMarker[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [selectedArea, setSelectedArea] = useState<string>("All");
  
  const [selectedBungalow, setSelectedBungalow] = useState<BungalowMarker | null>(null);
  const [nearbyAttractions, setNearbyAttractions] = useState<Attraction[]>([]);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(false);

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
    setIsLoadingAttractions(true);
    setNearbyAttractions([]);
    
    try {
      const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${bungalow.latitude}|${bungalow.longitude}&gsradius=10000&gslimit=20&format=json&origin=*`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      
      const allPlaces = geoData.query?.geosearch || [];
      
      // Filter out non-tourist locations like schools and hospitals
      const excludeKeywords = ['school', 'college', 'university', 'vidyalaya', 'hospital', 'clinic', 'medical', 'camp'];
      const places = allPlaces.filter((p: any) => {
        const title = p.title.toLowerCase();
        return !excludeKeywords.some(keyword => title.includes(keyword));
      });

      if (places.length === 0) {
        setIsLoadingAttractions(false);
        return;
      }
      
      // Take only the top 10 after filtering
      const topPlaces = places.slice(0, 10);
      const pageIds = topPlaces.map((p: any) => p.pageid).join('|');
      
      const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=200&exsentences=2&explaintext=true&pageids=${pageIds}&format=json&origin=*`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      
      const pages = detailsData.query?.pages || {};
      
      const attractions: Attraction[] = topPlaces.map((p: any) => {
        const page = pages[p.pageid];
        return {
          id: p.pageid,
          title: p.title,
          lat: p.lat,
          lon: p.lon,
          thumbnail: page?.thumbnail?.source,
          extract: page?.extract,
        };
      });
      
      setNearbyAttractions(attractions);
    } catch (error) {
      console.error("Error fetching attractions:", error);
    } finally {
      setIsLoadingAttractions(false);
    }
  };

  const clearAttractions = () => {
    setSelectedBungalow(null);
    setNearbyAttractions([]);
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
        
        {/* Search Box */}
        <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-3 w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search bungalow name (e.g. Visumpaya) or city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-slate-800 placeholder-slate-400 text-sm bg-transparent"
          />
        </div>

        {/* Filters Button */}
        <div className="flex gap-2 pointer-events-auto relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 bg-white border border-slate-200 shadow-lg rounded-2xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${showFilters ? 'text-blue-600 ring-2 ring-blue-500' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'}`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
          </button>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="absolute top-full mt-3 right-0 w-72 bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 z-20">
              
              {/* Area Filter */}
              <div className="mb-5">
                <h3 className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">location_on</span>
                  Filter by Area
                </h3>
                <select 
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
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
                  <span className="material-symbols-outlined text-[16px] text-blue-600">payments</span>
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

      {/* Attractions Overlay */}
      {selectedBungalow && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-slate-200 flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <span className="material-symbols-outlined text-purple-600">explore</span>
              {isLoadingAttractions ? (
                "Finding nearby attractions..."
              ) : (
                `Found ${nearbyAttractions.length} attractions near ${selectedBungalow.name}`
              )}
            </div>
            {!isLoadingAttractions && (
              <>
                <Link 
                  href={`/browse/${selectedBungalow.slug}`}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors ml-2"
                >
                  Book Bungalow
                </Link>
                <button 
                  onClick={clearAttractions}
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer transition-colors"
                  title="Clear Attractions"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <InteractiveMap 
        bungalows={filteredBungalows} 
        onBungalowClick={fetchNearbyAttractions}
        attractions={nearbyAttractions}
        selectedBungalow={selectedBungalow}
      />
    </>
  );
}
