"use client";

import React, { useState } from "react";

const BUNGALOWS = [
  {
    id: 1,
    title: "Nuwara Eliya Rest House",
    price: "Rs. 18,500",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
    top: "30%", left: "40%",
    status: "Available"
  },
  {
    id: 2,
    title: "Galle Fort Heritage",
    price: "Rs. 22,000",
    image: "https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    top: "60%", left: "30%",
    status: "Available"
  },
  {
    id: 3,
    title: "Kandy Lake View",
    price: "Rs. 15,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    top: "40%", left: "70%",
    status: "Booked"
  }
];

export default function MapPage() {
  const [activePin, setActivePin] = useState<number | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      
      {/* Map Header / Filters */}
      <div className="absolute top-6 left-6 right-6 z-10 flex gap-4 pointer-events-none">
        
        {/* Search Box */}
        <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-3 w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search region or bungalow..." 
            className="w-full focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 pointer-events-auto">
          <button className="px-4 py-3 bg-white border border-slate-200 shadow-md rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
          </button>
          <button className="px-4 py-3 bg-white border border-slate-200 shadow-md rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Availability
          </button>
        </div>

      </div>

      {/* Dummy Map Visual Container */}
      <div 
        className="flex-1 bg-slate-200 relative overflow-hidden flex items-center justify-center border-t border-slate-200"
        onClick={() => setActivePin(null)} // Click outside to close tooltip
      >
        
        {/* Placeholder Map Background - abstract grid */}
        <div className="absolute inset-0 opacity-20 transition-transform duration-1000 ease-in-out" 
             style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px', transform: activePin ? 'scale(1.05)' : 'scale(1)' }}>
        </div>

        {/* Dummy Map Pins */}
        {BUNGALOWS.map((b) => (
          <div 
            key={b.id}
            className="absolute cursor-pointer group"
            style={{ top: b.top, left: b.left }}
            onClick={(e) => { e.stopPropagation(); setActivePin(activePin === b.id ? null : b.id); }}
          >
             <div className={`w-5 h-5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] border-2 border-white relative z-10 transition-transform ${activePin === b.id ? 'scale-125' : 'group-hover:scale-110'} ${b.status === 'Available' ? 'bg-blue-600' : 'bg-amber-500'}`}></div>
             
             {/* Tooltip */}
             <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-56 bg-white p-3 rounded-2xl shadow-2xl border border-slate-200 transition-all origin-bottom z-20 ${activePin === b.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
               <img src={b.image} alt={b.title} className="w-full h-28 object-cover rounded-xl mb-3" />
               <h3 className="font-bold text-sm text-slate-800 leading-tight mb-1">{b.title}</h3>
               <div className="flex justify-between items-end">
                 <p className="font-bold text-blue-600 text-sm">{b.price}</p>
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${b.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                   {b.status}
                 </span>
               </div>
               
               {b.status === "Available" && (
                 <button className="w-full mt-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
                   View Details
                 </button>
               )}
             </div>
          </div>
        ))}

        {/* Centered Message indicating it's a dummy map (fade out if a pin is active) */}
        <div className={`bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center z-0 text-center transition-opacity duration-300 pointer-events-none ${activePin ? 'opacity-0' : 'opacity-100'}`}>
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">map</span>
          <h2 className="text-lg font-bold text-slate-800">Interactive Map View</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Click on the pins to view interactive bungalow details and availability.</p>
        </div>

      </div>

    </div>
  );
}
