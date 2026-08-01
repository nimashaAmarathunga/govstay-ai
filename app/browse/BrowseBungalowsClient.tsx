"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/booking/DateRangePicker";
import PaymentSlipUpload from "@/components/booking/PaymentSlipUpload";
import { useUser } from "@/components/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, SearchX, Star, MapPin, Users, BedDouble, 
  ChevronRight, ArrowLeft, ArrowRight, X, Phone, DoorOpen,
  Receipt, CheckCircle2, Loader2, Sparkles, AlertCircle
} from "lucide-react";

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

export default function BrowseBungalowsClient({ bungalows: initialBungalows }: BrowseBungalowsClientProps) {
  const { activeUser } = useUser();
  const [bungalows, setBungalows] = useState(initialBungalows);

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
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string | null>(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  const handleCloseModal = () => {
    setSelectedBungalow(null);
    setBookingStatus("idle");
    setSelectedRoomIds([]);
    setPaymentSlipUrl(null);
    setShowPaymentStep(false);
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
          paymentSlipUrl: paymentSlipUrl,
          userId: activeUser?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to make reservation");
      }

      setBookingStatus("success");
      setTimeout(() => {
        handleCloseModal();
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
    return `LKR ${price.toLocaleString()}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFDFD] relative">
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Discover Circuit Bungalows</h1>
              <p className="text-[15px] text-slate-500 font-medium">
                Find and book government rest houses and suites across Sri Lanka.
              </p>
            </div>
            <div className="w-full md:w-[320px]">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="text"
                  placeholder="Search locations, departments..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm focus:bg-white focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredBungalows.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm mt-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No bungalows found</h3>
              <p className="text-slate-500 text-[15px]">Try adjusting your search terms or location.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBungalows.map((bungalow, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={bungalow.id}
                className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer"
                onClick={() => {
                  setSelectedBungalow(bungalow);
                  setBookingStatus("idle");
                  setSelectedRoomIds([]);
                  setPaymentSlipUrl(null);
                  setShowPaymentStep(false);
                }}
              >
                <div className="h-56 w-full relative overflow-hidden shrink-0">
                  <img
                    src={bungalow.image}
                    alt={bungalow.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.1)] flex items-center gap-1.5 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-[13px] font-bold text-slate-900 leading-none">{bungalow.rating}</span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-slate-900/80 backdrop-blur-md w-max px-3 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/10">
                      {bungalow.department.split(" ")[0]}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col bg-white">
                  <h3 className="font-bold text-xl text-slate-900 mb-1.5 leading-snug group-hover:text-slate-700 transition-colors">
                    {bungalow.name}
                  </h3>
                  <p className="text-[13px] text-slate-500 flex items-center gap-1.5 mb-5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {bungalow.location}
                  </p>

                  <div className="flex items-center gap-4 text-[13px] font-medium text-slate-600 mb-6 border-b border-slate-100 pb-5">
                    <span className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-slate-400" />
                      {bungalow.noOfRooms} Rooms
                    </span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      Up to {bungalow.capacity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {bungalow.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-[11px] font-semibold tracking-wide border border-slate-100"
                      >
                        {amenity}
                      </span>
                    ))}
                    {bungalow.amenities.length > 3 && (
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-md text-[11px] font-semibold border border-slate-100 tracking-wide">
                        +{bungalow.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Starting at</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-2xl text-slate-900">{formatPrice(bungalow.price)}</span>
                        <span className="text-[12px] text-slate-500 font-medium">/ night</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-slate-900 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedBungalow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] relative z-10"
            >
              
              {/* Left side Image - adjusted for modal */}
              <div className="md:w-[45%] h-64 md:h-auto relative bg-slate-900 shrink-0">
                <img
                  src={selectedBungalow.image}
                  alt={selectedBungalow.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <button
                  onClick={handleCloseModal}
                  className="absolute top-6 left-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors md:hidden cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md rounded-lg border border-white/20">
                    {selectedBungalow.department}
                  </span>
                  <h3 className="font-bold text-3xl leading-tight mt-4 mb-2">{selectedBungalow.name}</h3>
                  <p className="text-[14px] text-white/80 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4" />
                    {selectedBungalow.location}
                  </p>
                </div>
              </div>

              {/* Right side Details */}
              <div className="md:w-[55%] p-8 md:p-10 flex flex-col overflow-y-auto bg-white">
                {!showPaymentStep ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="hidden md:block">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedBungalow.name}</h2>
                        <p className="text-[13px] text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedBungalow.location}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="hidden md:flex text-slate-400 hover:text-slate-900 cursor-pointer p-2 rounded-full hover:bg-slate-50 transition-colors ml-auto"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-slate-600 text-[14.5px] leading-relaxed mb-8 font-medium">
                      {selectedBungalow.description}
                    </p>

                    {selectedBungalow.caretaker && (
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-8 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-slate-700" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-[13px] uppercase tracking-wider mb-0.5">
                              Caretaker • {selectedBungalow.caretaker.name}
                            </span>
                            <span className="text-slate-500 font-medium">
                              {selectedBungalow.caretaker.telephoneNo}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`tel:${selectedBungalow.caretaker.telephoneNo}`}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
                        >
                          Call
                        </a>
                      </div>
                    )}

                    <div className="mb-8">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                        Select Stay Dates
                      </span>
                      <div className="border border-slate-100 p-1 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
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
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[13px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <DoorOpen className="w-4 h-4" />
                          Available Rooms ({selectedBungalow.rooms?.length || selectedBungalow.noOfRooms})
                        </h4>
                      </div>

                      {selectedBungalow.rooms && selectedBungalow.rooms.length > 0 ? (
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedBungalow.rooms.map((room) => {
                            const isSelected = selectedRoomIds.includes(room.id);
                            return (
                              <div
                                key={room.id}
                                onClick={() => toggleRoomSelection(room.id)}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-100 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-[14px] text-slate-900">
                                      Room {room.roomNumber}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                        room.roomType === "AC"
                                          ? "bg-slate-200 text-slate-800"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {room.roomType === "AC" ? "AC" : "Non-AC"}
                                    </span>
                                    <span className="text-[13px] text-slate-500 font-medium">
                                      {room.noOfBeds} Beds
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-slate-500 mt-1.5 font-medium">
                                    {room.items.join(" • ")}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-[14px] font-extrabold text-slate-900">
                                    {formatPrice(room.price)}
                                  </span>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                    isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'
                                  }`}>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-slate-400" />
                          <p className="text-[13px] text-slate-600 font-medium">
                            Please contact the caretaker directly for room allocation.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-6">
                      {checkIn && checkOut && (
                        <div className="mb-6 bg-slate-50 rounded-2xl p-5 border border-slate-100 text-[13px] space-y-3 animate-fade-in">
                          <div className="flex justify-between items-center text-slate-600 font-medium">
                            <span>
                              {selectedRoomIds.length === 0 ? "Entire Bungalow Rate" : `Selected Rooms (${selectedRoomIds.length})`}
                            </span>
                            <span className="font-bold text-slate-900">{formatPrice(pricePerNight)} / night</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600 font-medium">
                            <span>Duration</span>
                            <span className="font-bold text-slate-900">{nights} {nights === 1 ? "Night" : "Nights"}</span>
                          </div>
                          <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                            <span className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Total Cost</span>
                            <span className="text-xl font-extrabold text-slate-900">{formatPrice(totalCost)}</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setShowPaymentStep(true)}
                        disabled={!checkIn || !checkOut}
                        className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 text-[15px] ${
                          checkIn && checkOut
                            ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer active:scale-[0.98]"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {selectedRoomIds.length > 0
                          ? `Book Rooms (${selectedRoomIds.length})`
                          : "Book Entire Bungalow"}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => setShowPaymentStep(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="text-slate-400 hover:text-slate-800 cursor-pointer p-2 rounded-full hover:bg-slate-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Finalize Booking</h2>
                    <p className="text-slate-500 text-[14px] mb-8 font-medium">
                      Upload your payment slip to submit this reservation request.
                    </p>

                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 space-y-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-200">
                        <Receipt className="w-5 h-5 text-slate-500" />
                        Summary
                      </div>
                      <div className="space-y-3 text-[13px] font-medium text-slate-600">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-bold text-slate-900">{selectedBungalow.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rooms:</span>
                          <span className="font-bold text-slate-900">
                            {selectedRoomIds.length === 0 ? "Entire Bungalow" : selectedRooms.map(r => `${r.roomNumber}`).join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dates:</span>
                          <span className="font-bold text-slate-900">
                            {formatDateString(checkIn)} - {formatDateString(checkOut)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-slate-200 text-slate-900">
                          <span className="font-bold uppercase tracking-wider text-[11px]">Total Fee:</span>
                          <span className="text-[16px] font-extrabold">{formatPrice(totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <PaymentSlipUpload
                        onUploadComplete={(url) => setPaymentSlipUrl(url)}
                        value={paymentSlipUrl}
                      />
                    </div>

                    <div className="mt-auto pt-4">
                      {bookingStatus === "idle" && (
                        <button
                          onClick={handleBookNow}
                          disabled={!paymentSlipUrl}
                          className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 text-[15px] ${
                            paymentSlipUrl
                              ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer active:scale-[0.98]"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Submit Reservation
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      {bookingStatus === "booking" && (
                        <button
                          disabled
                          className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg flex justify-center items-center gap-2 cursor-wait text-[15px]"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </button>
                      )}
                      {bookingStatus === "success" && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center w-full shadow-sm">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <h4 className="font-bold text-emerald-900 text-lg mb-1">Booking Pending Approval!</h4>
                          <p className="text-[13px] text-emerald-700 font-medium">
                            You will be notified once the admin verifies the payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
