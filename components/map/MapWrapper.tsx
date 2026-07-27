"use client";

import dynamic from "next/dynamic";
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

export default function MapWrapper({ bungalows }: { bungalows: BungalowMarker[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [selectedArea, setSelectedArea] = useState<string>("All");

  // Standard 25 Districts of Sri Lanka for Area Filtering
  const uniqueAreas = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", 
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

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

      <InteractiveMap bungalows={filteredBungalows} />
    </>
  );
}
