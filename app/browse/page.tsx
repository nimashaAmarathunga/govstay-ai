"use client";

import React from "react";

const BUNGALOWS = [
  {
    id: 1,
    title: "Nuwara Eliya Rest House",
    location: "Nuwara Eliya, Central Province",
    price: "Rs. 18,500",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
    amenities: ["Garden View", "Fireplace", "Steward Service"],
  },
  {
    id: 2,
    title: "Galle Fort Heritage Bungalow",
    location: "Galle, Southern Province",
    price: "Rs. 22,000",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7B6uYfI_cOhVd_c31fC_V41wJt0605kQ7tD2xG63c-qM_d9sZl7Z5YjX8x5hH-G8l6r1B_F2b489FjH5gD6mP1XlR7D2d5w4m7V5p9w8c2h4_6N7f-t7n7N1Y7Z2Y7H4m4Z9n8X7Y2Z7J9N4m8X9g8X5g4n1Y7X4Z8m8V4X8d8X9p6m9V6f7_F1b4F1m8g9d8X9g8X5g4n1Y7X4Z8m8V4X8d8X9p6m9V6f7?sz=w400", // using placeholder, let's just use generic unsplash or same image for now. Actually wait, I can just use a similar long string or a standard placeholder. Let's use standard placeholders if it's dummy data.
  },
  {
    id: 3,
    title: "Kandy Lake View Circuit",
    location: "Kandy, Central Province",
    price: "Rs. 15,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: ["Lake View", "AC", "WiFi"],
  },
  {
    id: 4,
    title: "Yala Safari Lodge (Gov)",
    location: "Yala, Southern Province",
    price: "Rs. 25,000",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: ["Safari Access", "Full Board", "Guide"],
  }
];

// fixing image 2
BUNGALOWS[1].image = "https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
BUNGALOWS[1].amenities = ["Ocean View", "Historical", "AC"];


export default function BrowsePage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Browse Circuit Bungalows</h1>
            <p className="text-slate-500">Discover and book government-owned rest houses across Sri Lanka.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Filters
            </button>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
              <input type="text" placeholder="Search locations..." className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BUNGALOWS.map((bungalow) => (
            <div key={bungalow.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer">
              <div className="h-48 w-full relative overflow-hidden">
                <img src={bungalow.image} alt={bungalow.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                  <span className="text-xs font-bold text-slate-700">4.8</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800 mb-1">{bungalow.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {bungalow.location}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {bungalow.amenities.map(amenity => (
                    <span key={amenity} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{amenity}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-xl text-blue-600">{bungalow.price}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wide ml-1">/ night</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
