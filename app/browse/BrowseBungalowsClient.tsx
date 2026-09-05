"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, SearchX, Star, MapPin, Users, BedDouble, ChevronRight
} from "lucide-react";

export type DbRoom = {
  id: string;
  roomNumber: string;
  roomType: "AC" | "NON_AC";
  items: string[];
  noOfBeds: number;
  bed_count?: number;
  capacity?: number;
  price: number;
};

export type DbCaretaker = {
  id: string;
  name: string;
  address: string;
  telephoneNo: string;
  emailAddress?: string | null;
};

export type DbBooking = {
  id: string;
  roomId: string;
  fromDate: string;
  toDate: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
};

export type DbBungalow = {
  id: string;
  slug: string;
  name: string;
  location: string;
  noOfRooms: number;
  department: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  amenities: string[];
  highlights: string[];
  capacity: number;
  caretaker?: DbCaretaker | null;
  rooms?: DbRoom[];
  bookings?: DbBooking[];
};

interface BrowseBungalowsClientProps {
  bungalows: DbBungalow[];
}

export default function BrowseBungalowsClient({ bungalows }: BrowseBungalowsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBungalows = bungalows.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#21263A] mb-2 tracking-tight">Discover Circuit Bungalows</h1>
              <p className="text-[15px] text-[#21263A]/70 font-medium">
                Find and book government rest houses and suites across Sri Lanka.
              </p>
            </div>
            <div className="w-full md:w-[320px]">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#21263A]/50 group-focus-within:text-[#157954] transition-colors" />
                <input
                  type="text"
                  placeholder="Search locations, departments..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:bg-white focus:border-[#157954] focus:ring-2 focus:ring-[#C7CEE8] text-sm font-medium text-[#21263A] placeholder:text-[#21263A]/50 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredBungalows.length === 0 && (
            <div className="text-center py-24 bg-gradient-card-dark rounded-2xl border border-[#157954]/40 shadow-md mt-8">
              <div className="w-16 h-16 bg-[#D0D34D] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <SearchX className="w-8 h-8 text-[#21263A]" />
              </div>
              <h3 className="text-lg font-extrabold text-white mb-1">No bungalows found</h3>
              <p className="text-[#C7CEE8] text-[15px] font-medium">Try adjusting your search terms or location.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBungalows.map((bungalow, idx) => (
              <Link key={bungalow.id} href={`/browse/${bungalow.slug}`} className="block h-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gradient-bungalow-card rounded-[20px] border border-[#157954]/40 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer h-full"
                >
                  <div className="h-48 w-full relative overflow-hidden shrink-0">
                    <img
                      src={bungalow.image}
                      alt={bungalow.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#21263A]/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-slate-200">
                      <Star className="w-3.5 h-3.5 fill-[#D0D34D] text-[#157954]" />
                      <span className="text-[13px] font-extrabold text-[#21263A] leading-none">{bungalow.rating}</span>
                    </div>
                    
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-[#D0D34D] text-[#21263A] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-md">
                        {bungalow.department}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-xl text-white mb-1.5 leading-snug group-hover:text-[#D0D34D] transition-colors">
                      {bungalow.name}
                    </h3>
                    <p className="text-[13px] text-[#C7CEE8] flex items-center gap-1.5 mb-5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#D0D34D]" />
                      {bungalow.location}
                    </p>

                    <div className="flex items-center gap-4 text-[13px] font-semibold text-[#C7CEE8] mb-6 border-b border-white/10 pb-5">
                      <span className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-[#D0D34D]" />
                        {bungalow.rooms && bungalow.rooms.length > 0 ? bungalow.rooms.length : bungalow.noOfRooms} Rooms
                      </span>
                      <div className="w-1 h-1 bg-[#D0D34D] rounded-full"></div>
                      <span className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-[#D0D34D]" />
                        {bungalow.rooms?.reduce((total, r) => total + (r as any).bed_count, 0) || 0} Beds
                      </span>
                      <div className="w-1 h-1 bg-[#D0D34D] rounded-full"></div>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D0D34D]" />
                        Sleeps {bungalow.capacity}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {bungalow.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2.5 py-1 bg-white/10 text-white rounded-md text-[11px] font-semibold tracking-wide border border-white/20"
                        >
                          {amenity}
                        </span>
                      ))}
                      {bungalow.amenities.length > 3 && (
                        <span className="px-2.5 py-1 bg-white/10 text-[#C7CEE8] rounded-md text-[11px] font-semibold border border-white/20 tracking-wide">
                          +{bungalow.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <span className="text-[11px] text-[#C7CEE8] font-bold uppercase tracking-wider block mb-0.5">Starting at</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-2xl text-white">{formatPrice(bungalow.price)}</span>
                          <span className="text-[12px] text-[#C7CEE8] font-medium">/ night</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#D0D34D] text-[#21263A] group-hover:bg-white flex items-center justify-center transition-all shadow-md">
                        <ChevronRight className="w-5 h-5 text-[#21263A] font-bold" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
