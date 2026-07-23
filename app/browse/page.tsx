"use client";

import { useState } from "react";
import Link from "next/link";
import { BUNGALOWS } from "@/lib/bungalows";

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBungalow, setSelectedBungalow] = useState<typeof BUNGALOWS[0] | null>(null);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "success">("idle");

  const filteredBungalows = BUNGALOWS.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookNow = () => {
    setBookingStatus("booking");
    setTimeout(() => {
      setBookingStatus("success");
      setTimeout(() => {
        setSelectedBungalow(null);
        setBookingStatus("idle");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Browse Circuit Bungalows</h1>
              <p className="text-slate-500">Discover and book government-owned rest houses across Sri Lanka.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Filters
              </button>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search locations..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredBungalows.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
              <h3 className="text-lg font-semibold text-slate-600">No bungalows found</h3>
              <p className="text-slate-500">Try adjusting your search terms.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBungalows.map((bungalow) => (
              <div key={bungalow.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="h-48 w-full relative overflow-hidden shrink-0">
                  <img src={bungalow.image} alt={bungalow.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                    <span className="text-xs font-bold text-slate-700">4.8</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
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
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                    <div>
                      <span className="font-bold text-xl text-blue-600">{bungalow.price}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wide ml-1">/ night</span>
                    </div>
                    <button
                      onClick={() => { setSelectedBungalow(bungalow); setBookingStatus("idle"); }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details & Booking Modal */}
      {selectedBungalow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

            {/* Left side Image */}
            <div className="md:w-1/2 h-64 md:h-auto relative">
              <img src={selectedBungalow.image} alt={selectedBungalow.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedBungalow(null)}
                className="absolute top-4 left-4 w-10 h-10 bg-white/50 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 transition-colors md:hidden cursor-pointer"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>

            {/* Right side Details */}
            <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{selectedBungalow.title}</h2>
                <button
                  onClick={() => setSelectedBungalow(null)}
                  className="hidden md:flex text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-slate-500 flex items-center gap-1 mb-6">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {selectedBungalow.location}
              </p>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {selectedBungalow.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="material-symbols-outlined text-blue-600 mb-1">meeting_room</span>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Rooms</p>
                  <p className="text-lg font-bold text-slate-800">{selectedBungalow.rooms}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="material-symbols-outlined text-blue-600 mb-1">group</span>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Persons / Room</p>
                  <p className="text-lg font-bold text-slate-800">{selectedBungalow.capacity}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Amenities included</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBungalow.amenities.map(amenity => (
                    <span key={amenity} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {amenity}
                    </span>
                  ))}
                </div>
                <Link href={`/browse/${selectedBungalow.slug}`} className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                  View Details
                </Link>
              </div>

              <div className="mt-auto border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-medium">Cost per night</span>
                  <span className="text-2xl font-bold text-blue-600">{selectedBungalow.price}</span>
                </div>

                {bookingStatus === "idle" && (
                  <button
                    onClick={handleBookNow}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    Book This Bungalow
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                )}
                {bookingStatus === "booking" && (
                  <button disabled className="w-full py-4 bg-blue-400 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2 cursor-wait">
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Processing Reservation...
                  </button>
                )}
                {bookingStatus === "success" && (
                  <button disabled className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Booking Confirmed!
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
