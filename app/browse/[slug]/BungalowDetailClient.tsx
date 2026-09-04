"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/booking/DateRangePicker";
import PaymentSlipUpload from "@/components/booking/PaymentSlipUpload";
import { useUser } from "@/components/context/UserContext";

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

export type DbBungalowDetails = {
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
  rooms: DbRoom[];
  bookings?: DbBooking[];
};

interface BungalowDetailClientProps {
  bungalow: DbBungalowDetails;
}

import { useRouter } from "next/navigation";

export default function BungalowDetailClient({ bungalow }: BungalowDetailClientProps) {
  const router = useRouter();
  const { activeUser } = useUser();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

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
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [roomFilter, setRoomFilter] = useState<"ALL" | "AC" | "NON_AC">("ALL");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "booking" | "success" | "awaiting-slip">("idle");
  const [bookedRoomNumbers, setBookedRoomNumbers] = useState<string[]>([]);
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string | null>(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const formatDateString = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isDateBooked = (date: Date) => {
    if (!bungalow.bookings || bungalow.bookings.length === 0) return false;

    const checkTime = new Date(date);
    checkTime.setHours(0, 0, 0, 0);

    const activeBookings = bungalow.bookings.filter(b => 
      b.status === "CONFIRMED" || b.status === "PENDING"
    );

    const parseLocalDate = (isoString: string) => {
      const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    return activeBookings.some(booking => {
      if (selectedRoomIds.length > 0 && !selectedRoomIds.includes(booking.roomId)) {
        return false;
      }
      
      const from = parseLocalDate(booking.fromDate);
      const to = parseLocalDate(booking.toDate);

      return checkTime >= from && checkTime < to;
    });
  };

  const checkDatesOverlap = (start: Date, end: Date, roomIds: string[]) => {
    if (!bungalow.bookings || bungalow.bookings.length === 0) return false;

    const checkStart = new Date(start);
    checkStart.setHours(0, 0, 0, 0);
    const checkEnd = new Date(end);
    checkEnd.setHours(0, 0, 0, 0);

    const activeBookings = bungalow.bookings.filter(b => 
      b.status === "CONFIRMED" || b.status === "PENDING"
    );

    const parseLocalDate = (isoString: string) => {
      const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    return activeBookings.some(booking => {
      if (roomIds.length > 0 && !roomIds.includes(booking.roomId)) {
        return false;
      }

      const from = parseLocalDate(booking.fromDate);
      const to = parseLocalDate(booking.toDate);

      return checkStart < to && checkEnd > from;
    });
  };

  // Find first available dates on mount if tomorrow/day-after-tomorrow are booked
  useEffect(() => {
    if (checkIn && checkOut && checkDatesOverlap(checkIn, checkOut, [])) {
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
  }, []);

  let nights = 0;
  let days = 0;
  if (checkIn && checkOut) {
    const diff = checkOut.getTime() - checkIn.getTime();
    nights = Math.round(diff / (1000 * 60 * 60 * 24));
    days = nights + 1;
  }

  const selectedRooms = bungalow.rooms.filter((r) => selectedRoomIds.includes(r.id));
  const isEntireBungalow = selectedRooms.length === 0;

  const pricePerNight = isEntireBungalow
    ? bungalow.rooms.reduce((sum, r) => sum + r.price, 0)
    : selectedRooms.reduce((sum, r) => sum + r.price, 0);

  const totalCost = pricePerNight * nights;

  const filteredRooms = bungalow.rooms.filter((room) => {
    if (roomFilter === "AC") return room.roomType === "AC";
    if (roomFilter === "NON_AC") return room.roomType === "NON_AC";
    return true;
  });

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

  const selectAllRooms = () => {
    let updatedRoomIds: string[] = [];
    if (selectedRoomIds.length !== bungalow.rooms.length) {
      updatedRoomIds = bungalow.rooms.map((r) => r.id);
    }

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

  const handleBooking = async () => {
    if (!checkIn || !checkOut) return;
    setBookingStatus("booking");
    
    try {
      const formatYYYYMMDD = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circuitBungalowId: bungalow.id,
          roomIds: selectedRoomIds,
          fromDate: formatYYYYMMDD(checkIn),
          toDate: formatYYYYMMDD(checkOut),
          totalCost: totalCost,
          userId: activeUser?.id,
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit booking');
      }

      const data = await response.json();
      
      let createdBookingId = null;
      if (data.bookings && data.bookings.length > 0) {
        createdBookingId = data.bookings[0].bookingId;
      } else {
        createdBookingId = data.id || data.bookingId;
      }
      
      setActiveBookingId(createdBookingId);
      
      const selectedRoomNums = bungalow.rooms
        .filter((r) => selectedRoomIds.includes(r.id))
        .map((r) => r.roomNumber);
      setBookedRoomNumbers(selectedRoomNums.length > 0 ? selectedRoomNums : ["Entire Bungalow"]);

      setBookingStatus("awaiting-slip");
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(error.message || "An error occurred while booking. Please try again.");
      setBookingStatus("idle");
    }
  };

  const resetBooking = () => {
    setBookingStatus("idle");
    setSelectedRoomIds([]);
    setPaymentSlipUrl(null);
    setShowPaymentStep(false);
  };

  const acRoomsCount = bungalow.rooms.filter((r) => r.roomType === "AC").length;
  const nonAcRoomsCount = bungalow.rooms.filter((r) => r.roomType === "NON_AC").length;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8 md:py-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to browse
          </Link>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-900 text-white rounded-full border border-slate-900">
            {bungalow.department}
          </span>
        </div>

        {/* Hero Card */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-72 sm:h-96 lg:h-[28rem]">
            <img 
              src={bungalow.image} 
              alt={bungalow.name} 
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
              }}
              className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 shadow-md backdrop-blur-md">
              <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
              <span className="text-sm font-bold text-slate-800">{bungalow.rating}</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block px-3 py-1 mb-2 text-xs font-bold uppercase tracking-wider bg-slate-900/90 backdrop-blur-sm rounded-md text-white">
                {bungalow.department}
              </span>
              <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl drop-shadow-sm">
                {bungalow.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-200 font-medium">
                <span className="material-symbols-outlined text-[18px] text-slate-300">location_on</span>
                {bungalow.location}
              </p>
            </div>
          </div>

          {/* Details Content Grid */}
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
            
            {/* Main Info Column */}
            <div>
              {/* Description */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-3">About this Circuit Bungalow</h2>
                <p className="text-base leading-7 text-slate-600">{bungalow.description}</p>
              </section>

              {/* Caretaker Contact Information */}
              {bungalow.caretaker && (
                <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">contact_phone</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Caretaker Information</h3>
                      <p className="text-xs text-slate-500">Official bungalow in-charge & key contact</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-slate-900 mt-0.5">person</span>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">In-Charge Name</span>
                        <span className="font-semibold text-slate-700">{bungalow.caretaker.name}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-slate-900 mt-0.5">call</span>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Telephone</span>
                        <a
                          href={`tel:${bungalow.caretaker.telephoneNo}`}
                          className="font-semibold text-slate-900 hover:underline"
                        >
                          {bungalow.caretaker.telephoneNo}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-slate-900 mt-0.5">home</span>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Caretaker Address</span>
                        <span className="font-semibold text-slate-700">{bungalow.caretaker.address}</span>
                      </div>
                    </div>

                    {bungalow.caretaker.emailAddress && (
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[18px] text-slate-900 mt-0.5">mail</span>
                        <div>
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Email Address</span>
                          <a
                            href={`mailto:${bungalow.caretaker.emailAddress}`}
                            className="font-semibold text-slate-900 hover:underline"
                          >
                            {bungalow.caretaker.emailAddress}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Highlights */}
              <section className="mb-8 border-t border-slate-100 pt-7">
                <h2 className="text-xl font-bold text-slate-800 mb-4">What makes this stay special</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {bungalow.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm font-medium text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bungalow Amenities */}
              <section className="mb-8 border-t border-slate-100 pt-7">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Property Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {bungalow.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-800 border border-slate-200 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">done</span>
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>

              {/* SPECIFIC ROOMS AVAILABLE INSIDE THIS BUNGALOW */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-800">Rooms Available Inside</h2>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-900 text-white">
                        {bungalow.rooms.length} {bungalow.rooms.length === 1 ? "Room" : "Rooms"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      (Guests can reserve individual rooms or book the whole bungalow)
                    </p>
                  </div>

                  {/* Room Filters */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setRoomFilter("ALL")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        roomFilter === "ALL"
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All ({bungalow.rooms.length})
                    </button>
                    {acRoomsCount > 0 && (
                      <button
                        onClick={() => setRoomFilter("AC")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          roomFilter === "AC"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">ac_unit</span>
                        AC ({acRoomsCount})
                      </button>
                    )}
                    {nonAcRoomsCount > 0 && (
                      <button
                        onClick={() => setRoomFilter("NON_AC")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          roomFilter === "NON_AC"
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">air</span>
                        Non-AC ({nonAcRoomsCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Selection Actions */}
                <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-500">
                  <span>Select specific rooms to rent:</span>
                  <button
                    onClick={selectAllRooms}
                    className="text-slate-900 hover:underline cursor-pointer font-bold"
                  >
                    {selectedRoomIds.length === bungalow.rooms.length
                      ? "Deselect All Rooms"
                      : "Select All Rooms"}
                  </button>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRooms.map((room) => {
                    const isSelected = selectedRoomIds.includes(room.id);
                    return (
                      <div
                        key={room.id}
                        onClick={() => toggleRoomSelection(room.id)}
                        className={`rounded-2xl border p-5 transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "border-slate-900 bg-slate-50 shadow-md ring-2 ring-slate-900/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          {/* Room Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-slate-900 text-[20px]">
                                meeting_room
                              </span>
                              <h3 className="font-bold text-slate-800 text-base">
                                Room {room.roomNumber}
                              </h3>
                            </div>

                            {/* Room Type Badge */}
                            <span
                               className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-slate-100 text-slate-700"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {room.roomType === "AC" ? "ac_unit" : "mode_fan"}
                              </span>
                              {room.roomType === "AC" ? "AC Room" : "Non-AC"}
                            </span>
                          </div>

                          {/* Bed Count */}
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                              bed
                            </span>
                            <span>{room.bed_count || room.noOfBeds} Beds available (Sleeps {room.capacity})</span>
                          </div>

                          {/* In-Room Items */}
                          <div className="mb-4">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Room Features & Items
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {room.items.map((item) => (
                                <span
                                  key={item}
                                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200/60"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Room Selection Footer */}
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-2">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Rate / Night</span>
                            <span className="text-sm font-bold text-slate-900">Rs. {room.price.toLocaleString()}</span>
                          </div>
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          >
                            {isSelected ? "Selected ✓" : "Select Room"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar Column */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                    Base Rate
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatPrice(bungalow.price)}
                  </span>
                </div>
                <span className="text-xs uppercase font-semibold text-slate-500">/ night</span>
              </div>

              {/* Property Quick Summary */}
              <div className="space-y-3.5 mb-6 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                    Total Capacity
                  </span>
                  <span className="font-semibold text-slate-800">{bungalow.capacity} guests</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">door_open</span>
                    Total Rooms
                  </span>
                  <span className="font-semibold text-slate-800">{bungalow.noOfRooms} rooms</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
                    Check-in
                  </span>
                  <span className="font-semibold text-slate-800">From 2:00 PM</span>
                </div>
              </div>

              {!showPaymentStep ? (
                <>
                  {/* Date Selection Section */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Select Dates
                    </h4>
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

                  {/* Selected Rooms Box */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Selected Rooms ({selectedRoomIds.length})
                    </span>

                    {selectedRoomIds.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No specific rooms selected. Booking will reserve the Entire Bungalow.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {bungalow.rooms
                          .filter((r) => selectedRoomIds.includes(r.id))
                          .map((r) => (
                            <span
                              key={r.id}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-bold"
                            >
                              Room {r.roomNumber}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Pricing Breakdown */}
                  {checkIn && checkOut && (
                    <div className="border-t border-slate-100 pt-4 mb-6 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>
                          {isEntireBungalow ? "Entire Bungalow Rate" : `Selected Rooms (${selectedRooms.length})`}
                        </span>
                        <span className="font-semibold text-slate-700">{formatPrice(pricePerNight)} / night</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Duration</span>
                        <span className="font-semibold text-slate-700">{nights} {nights === 1 ? "Night" : "Nights"}</span>
                      </div>
                      <div className="border-t border-slate-100/60 pt-2 flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-800">Total Price</span>
                        <span className="text-lg text-slate-900">{formatPrice(totalCost)}</span>
                      </div>
                    </div>
                  )}

                  {/* Proceed to Payment Step Button */}
                  <button
                    onClick={() => {
                      if (!activeUser) {
                        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                        return;
                      }
                      setShowPaymentStep(true);
                    }}
                    disabled={!checkIn || !checkOut}
                    className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                      checkIn && checkOut
                        ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer active:scale-[0.99]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {selectedRoomIds.length > 0
                      ? `Book Selected (${selectedRoomIds.length} ${selectedRoomIds.length === 1 ? 'Room' : 'Rooms'})`
                      : "Book Entire Bungalow"}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </>
              ) : (
                <div>
                  <button
                    onClick={() => setShowPaymentStep(false)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Change Rooms or Dates
                  </button>

                  <h4 className="font-bold text-slate-900 text-base mb-1">Upload Payment Slip</h4>
                  <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                    Attach your bank transfer or deposit slip to submit this manual booking request.
                  </p>

                  {/* Summary Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">Property:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[160px]">{bungalow.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">Selected Rooms:</span>
                      <span className="font-bold text-slate-900">
                        {selectedRoomIds.length === 0 
                          ? "Entire Bungalow" 
                          : `Room ${selectedRooms.map(r => r.roomNumber).sort().join(", ")}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">Stay Dates:</span>
                      <span className="font-bold text-slate-900">
                        {formatDateString(checkIn)} - {formatDateString(checkOut)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-800">Total Payable:</span>
                      <span className="font-extrabold text-slate-900">{formatPrice(totalCost)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {bookingStatus === "idle" && (
                    <button
                      onClick={handleBooking}
                      className="w-full py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm bg-slate-900 text-white hover:bg-slate-800 cursor-pointer active:scale-[0.99]"
                    >
                      <span>Submit Reservation</span>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                  )}

                  {bookingStatus === "booking" && (
                    <button
                      disabled
                      className="w-full py-4 bg-slate-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-wait text-sm"
                    >
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      Submitting Reservation...
                    </button>
                  )}

                  {/* Payment Slip Upload Component */}
                  {bookingStatus === "awaiting-slip" && activeBookingId && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5 shadow-sm">
                      <h4 className="font-bold text-amber-900 text-base mb-2">Upload Payment Slip</h4>
                      <p className="text-xs text-amber-700 font-medium mb-4">
                        Your reservation is pending. Please upload your payment slip to confirm.
                      </p>
                      <PaymentSlipUpload
                        onUploadComplete={(url) => {
                          setPaymentSlipUrl(url);
                          setBookingStatus("success");
                          setTimeout(() => {
                            window.location.reload();
                          }, 3500);
                        }}
                        value={paymentSlipUrl}
                        bookingId={activeBookingId}
                        userId={activeUser?.id}
                      />
                    </div>
                  )}

                  {bookingStatus === "success" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center shadow-sm">
                      <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">
                        check_circle
                      </span>
                      <h4 className="font-bold text-emerald-900 text-base mb-1">Reservation Pending Approval!</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed font-medium mb-4">
                        Your reservation request for <strong>{bungalow.name}</strong> ({bookedRoomNumbers.join(", ")}) has been recorded with status <strong>Pending</strong>.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/bookings"
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                        >
                          <span>View in My Reservations</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                        <button
                          onClick={resetBooking}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                        >
                          Make another selection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-4 text-center text-xs text-slate-400 leading-relaxed">
                Verification & official quota applied automatically during checkout.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
