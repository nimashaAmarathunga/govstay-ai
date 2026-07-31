"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/booking/DateRangePicker";

export type DbRoom = {
  id: string;
  roomNumber: string;
  roomType: "AC" | "NON_AC";
  items: string[];
  noOfBeds: number;
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
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getDayAfterTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [checkIn, setCheckIn] = useState<Date | null>(getTomorrow());
  const [checkOut, setCheckOut] = useState<Date | null>(getDayAfterTomorrow());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBungalow, setSelectedBungalow] = useState<DbBungalow | null>(null);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "success">("idle");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  const formatDateString = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isDateBooked = (date: Date) => {
    if (!selectedBungalow || !selectedBungalow.bookings || selectedBungalow.bookings.length === 0) return false;

    const checkTime = new Date(date);
    checkTime.setHours(0, 0, 0, 0);

    const activeBookings = selectedBungalow.bookings.filter(b => 
      b.status === "CONFIRMED" || b.status === "PENDING"
    );

    return activeBookings.some(booking => {
      if (selectedRoomIds.length > 0 && !selectedRoomIds.includes(booking.roomId)) {
        return false;
      }
      
      const from = new Date(booking.fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(booking.toDate);
      to.setHours(0, 0, 0, 0);

      return checkTime >= from && checkTime < to;
    });
  };

  const checkDatesOverlap = (start: Date, end: Date, roomIds: string[]) => {
    if (!selectedBungalow || !selectedBungalow.bookings || selectedBungalow.bookings.length === 0) return false;

    const checkStart = new Date(start);
    checkStart.setHours(0, 0, 0, 0);
    const checkEnd = new Date(end);
    checkEnd.setHours(0, 0, 0, 0);

    const activeBookings = selectedBungalow.bookings.filter(b => 
      b.status === "CONFIRMED" || b.status === "PENDING"
    );

    return activeBookings.some(booking => {
      if (roomIds.length > 0 && !roomIds.includes(booking.roomId)) {
        return false;
      }

      const from = new Date(booking.fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(booking.toDate);
      to.setHours(0, 0, 0, 0);

      return checkStart < to && checkEnd > from;
    });
  };

  // Adjust dates when selectedBungalow changes if they are booked
  useEffect(() => {
    if (selectedBungalow && checkIn && checkOut && checkDatesOverlap(checkIn, checkOut, [])) {
      let tempCheckIn = getTomorrow();
      let tempCheckOut = getDayAfterTomorrow();
      for (let i = 0; i < 365; i++) {
        if (!checkDatesOverlap(tempCheckIn, tempCheckOut, [])) {
          setCheckIn(tempCheckIn);
          setCheckOut(tempCheckOut);
          break;
        }
        tempCheckIn = new Date(tempCheckIn);
        tempCheckIn.setDate(tempCheckIn.getDate() + 1);
        tempCheckOut = new Date(tempCheckIn);
        tempCheckOut.setDate(tempCheckOut.getDate() + 1);
      }
    }
  }, [selectedBungalow]);

  let nights = 0;
  let days = 0;
  if (checkIn && checkOut) {
    const diff = checkOut.getTime() - checkIn.getTime();
    nights = Math.round(diff / (1000 * 60 * 60 * 24));
    days = nights + 1;
  }

  const selectedRooms = selectedBungalow?.rooms?.filter((r) => selectedRoomIds.includes(r.id)) || [];
  const isEntireBungalow = selectedRooms.length === 0;

  const pricePerNight = selectedBungalow?.rooms 
    ? (isEntireBungalow 
        ? selectedBungalow.rooms.reduce((sum, r) => sum + r.price, 0)
        : selectedRooms.reduce((sum, r) => sum + r.price, 0))
    : (selectedBungalow?.price || 0);

  const totalCost = pricePerNight * nights;

  const filteredBungalows = bungalows.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookNow = async () => {
    if (!selectedBungalow || !checkIn || !checkOut) return;
    setBookingStatus("booking");
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circuitBungalowId: selectedBungalow.id,
          roomIds: selectedRoomIds,
          fromDate: checkIn.toISOString(),
          toDate: checkOut.toISOString(),
          totalCost: totalCost,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to make reservation");
      }

      setBookingStatus("success");
      setTimeout(() => {
        setSelectedBungalow(null);
        setBookingStatus("idle");
        setSelectedRoomIds([]);
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      alert(error.message || "An error occurred while booking. Please try again.");
      setBookingStatus("idle");
    }
  };

  const toggleRoomSelection = (roomId: string) => {
    const updatedRoomIds = selectedRoomIds.includes(roomId)
      ? selectedRoomIds.filter((id) => id !== roomId)
      : [...selectedRoomIds, roomId];
    
    if (checkIn && checkOut) {
      const hasOverlap = checkDatesOverlap(checkIn, checkOut, updatedRoomIds);
      if (hasOverlap) {
        setCheckIn(null);
        setCheckOut(null);
        alert("The selected dates are already taken for the newly selected room configuration. Please pick new dates.");
      }
    }
    setSelectedRoomIds(updatedRoomIds);
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Browse Circuit Bungalows</h1>
              <p className="text-slate-500">
                Discover, view available room types, and book government rest houses across Sri Lanka.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search locations, departments..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm bg-white text-slate-800 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredBungalows.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                search_off
              </span>
              <h3 className="text-lg font-semibold text-slate-600">No bungalows found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search terms.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBungalows.map((bungalow) => (
              <div
                key={bungalow.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="h-48 w-full relative overflow-hidden shrink-0">
                  <img
                    src={bungalow.image}
                    alt={bungalow.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                    <span className="text-xs font-bold text-slate-800">{bungalow.rating}</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-md text-white text-[11px] font-semibold uppercase tracking-wider">
                    {bungalow.department.split(" ")[0]}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 leading-snug">
                    {bungalow.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      location_on
                    </span>
                    {bungalow.location}
                  </p>

                  {/* Room Quick Summary */}
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs font-medium text-slate-600 mb-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        meeting_room
                      </span>
                      {bungalow.noOfRooms} Rooms
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        group
                      </span>
                      Up to {bungalow.capacity} guests
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {bungalow.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100/60"
                      >
                        {amenity}
                      </span>
                    ))}
                    {bungalow.amenities.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium">
                        +{bungalow.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                    <div>
                      <span className="text-xs text-slate-500 block mb-0.5">Rooms starting from</span>
                      <span className="font-bold text-xl text-blue-600">{formatPrice(bungalow.price)}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wide ml-1">/ night</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBungalow(bungalow);
                        setBookingStatus("idle");
                        setSelectedRoomIds([]);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      View Details
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick View Details & Rooms Modal */}
      {selectedBungalow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left side Image */}
            <div className="md:w-5/12 h-56 md:h-auto relative bg-slate-900">
              <img
                src={selectedBungalow.image}
                alt={selectedBungalow.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              
              <button
                onClick={() => setSelectedBungalow(null)}
                className="absolute top-4 left-4 w-9 h-9 bg-white/70 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 transition-colors md:hidden cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 rounded-md">
                  {selectedBungalow.department}
                </span>
                <h3 className="font-bold text-xl leading-tight mt-1">{selectedBungalow.name}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {selectedBungalow.location}
                </p>
              </div>
            </div>

            {/* Right side Details */}
            <div className="md:w-7/12 p-6 md:p-8 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedBungalow.name}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      location_on
                    </span>
                    {selectedBungalow.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBungalow(null)}
                  className="hidden md:flex text-slate-400 hover:text-slate-800 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                {selectedBungalow.description}
              </p>

              {/* Caretaker Info */}
              {selectedBungalow.caretaker && (
                <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100 mb-5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">
                      contact_phone
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Caretaker: {selectedBungalow.caretaker.name}
                      </span>
                      <span className="text-slate-500">
                        {selectedBungalow.caretaker.telephoneNo}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${selectedBungalow.caretaker.telephoneNo}`}
                    className="px-3 py-1 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Call
                  </a>
                </div>
              )}

              {/* Date Selection Section */}
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Select Dates
                </span>
                <DateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(start, end) => {
                    setCheckIn(start);
                    setCheckOut(end);
                  }}
                  isDateDisabled={isDateBooked}
                />
              </div>

              {/* AVAILABLE ROOMS SECTION */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">
                      door_open
                    </span>
                    Rooms Available ({selectedBungalow.rooms?.length || selectedBungalow.noOfRooms})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Rent specific rooms or whole stay)
                  </span>
                </div>

                {selectedBungalow.rooms && selectedBungalow.rooms.length > 0 ? (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {selectedBungalow.rooms.map((room) => {
                      const isSelected = selectedRoomIds.includes(room.id);
                      return (
                        <div
                          key={room.id}
                          onClick={() => toggleRoomSelection(room.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 shadow-sm"
                              : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800">
                                Room {room.roomNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  room.roomType === "AC"
                                    ? "bg-cyan-100 text-cyan-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {room.roomType === "AC" ? "AC" : "Non-AC"}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                ({room.noOfBeds} Beds)
                              </span>
                              <span className="text-xs font-bold text-blue-600">
                                • {formatPrice(room.price)}/night
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {room.items.join(" • ")}
                            </p>
                          </div>

                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isSelected ? "Selected ✓" : "Select"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Contact caretaker for room allocation details.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto border-t border-slate-100 pt-5">
                {checkIn && checkOut && (
                  <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>
                        {selectedRoomIds.length === 0 ? "Entire Bungalow Rate" : `Selected Rooms (${selectedRoomIds.length})`}
                      </span>
                      <span className="font-semibold text-slate-700">{formatPrice(pricePerNight)} / night</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Duration</span>
                      <span className="font-semibold text-slate-700">{nights} {nights === 1 ? "Night" : "Nights"} ({days} Days)</span>
                    </div>
                    <div className="border-t border-slate-100/60 pt-1.5 flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-800">Total Cost</span>
                      <span className="text-lg text-blue-600">{formatPrice(totalCost)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-medium">Rooms starting from</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(selectedBungalow.price)} <span className="text-sm font-normal text-slate-500 uppercase">/ night</span></span>
                </div>

                {bookingStatus === "idle" && (
                  <button
                    onClick={handleBookNow}
                    disabled={!checkIn || !checkOut}
                    className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-sm ${
                      checkIn && checkOut
                        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {selectedRoomIds.length > 0
                      ? `Book Selected Rooms (${selectedRoomIds.length})`
                      : "Book Entire Bungalow"}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
                {bookingStatus === "booking" && (
                  <button
                    disabled
                    className="w-full py-3.5 bg-blue-400 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2 cursor-wait text-sm"
                  >
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    Processing Reservation...
                  </button>
                )}
                {bookingStatus === "success" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center w-full">
                    <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1">check_circle</span>
                    <h4 className="font-bold text-emerald-900 text-sm animate-fade-in">Booking Confirmed!</h4>
                    {checkIn && checkOut && (
                      <p className="text-xs text-emerald-700 mt-1 font-medium animate-fade-in">
                        {formatDateString(checkIn)} - {formatDateString(checkOut)} • {nights} {nights === 1 ? 'Night' : 'Nights'} • {formatPrice(totalCost)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
