"use client";

import React from "react";

export default function MapPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      
      {/* Map Header / Filters */}
      <div className="absolute top-6 left-6 right-6 z-10 flex gap-4 pointer-events-none">
        
        {/* Search Box */}
        <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-3 w-96">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search region or bungalow..." 
            className="w-full focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 pointer-events-auto">
          <button className="px-4 py-3 bg-white border border-slate-200 shadow-md rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
          </button>
          <button className="px-4 py-3 bg-white border border-slate-200 shadow-md rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Availability
          </button>
        </div>

      </div>

      {/* Dummy Map Visual Container */}
      <div className="flex-1 bg-slate-200 relative overflow-hidden flex items-center justify-center border-t border-slate-200">
        
        {/* Placeholder Map Background - abstract grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Dummy Map Pins */}
        <div className="absolute top-[30%] left-[40%] cursor-pointer group">
           <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-white relative z-10"></div>
           {/* Tooltip */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-xl shadow-xl border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ" alt="Nuwara Eliya" className="w-full h-24 object-cover rounded-lg mb-2" />
             <p className="font-bold text-sm text-slate-800 leading-tight">Nuwara Eliya Rest House</p>
             <p className="font-bold text-blue-600 text-sm mt-1">Rs. 18,500</p>
           </div>
        </div>

        <div className="absolute top-[60%] left-[30%] cursor-pointer group">
           <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-white relative z-10"></div>
           {/* Tooltip */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-xl shadow-xl border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
             <img src="https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Galle Fort" className="w-full h-24 object-cover rounded-lg mb-2" />
             <p className="font-bold text-sm text-slate-800 leading-tight">Galle Fort Heritage</p>
             <p className="font-bold text-blue-600 text-sm mt-1">Rs. 22,000</p>
           </div>
        </div>

        <div className="absolute top-[40%] left-[70%] cursor-pointer group">
           <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-white relative z-10"></div>
        </div>

        {/* Centered Message indicating it's a dummy map */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center z-0 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">map</span>
          <h2 className="text-lg font-bold text-slate-800">Interactive Map View</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-1">This is a placeholder for the map component (e.g., Google Maps or Mapbox). Hover over the blue pins to see dummy data.</p>
        </div>

      </div>

    </div>
  );
}
