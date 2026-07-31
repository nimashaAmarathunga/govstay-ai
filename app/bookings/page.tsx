"use client";

import React, { useState, useEffect } from "react";

const INITIAL_BOOKINGS = [
  {
    id: "BKG-2024-892",
    bookingId: "BKG-2024-892",
    title: "Nuwara Eliya Rest House",
    date: "Sept 14 - Sept 16, 2024",
    status: "Confirmed",
    amount: "Rs. 38,200",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
  },
  {
    id: "BKG-2024-710",
    bookingId: "BKG-2024-710",
    title: "Galle Fort Heritage Bungalow",
    date: "Aug 02 - Aug 05, 2024",
    status: "Completed",
    amount: "Rs. 67,500",
    image: "https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "BKG-2023-112",
    bookingId: "BKG-2023-112",
    title: "Kandy Lake View Circuit",
    date: "Dec 10 - Dec 12, 2023",
    status: "Completed",
    amount: "Rs. 31,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  }
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>(INITIAL_BOOKINGS);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      
      const formattedDbBookings = (data || []).map((b: any) => {
        const from = new Date(b.fromDate);
        const to = new Date(b.toDate);
        const dateStr = `${from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        
        let displayStatus = "Pending";
        if (b.status === "CONFIRMED") displayStatus = "Confirmed";
        if (b.status === "CANCELLED") displayStatus = "Cancelled";
        if (b.status === "REJECTED") displayStatus = "Rejected";

        return {
          id: b.id,
          bookingId: b.bookingId || b.id,
          title: `${b.circuitBungalow.name} (Room ${b.room.roomNumber})`,
          date: dateStr,
          status: displayStatus,
          amount: `Rs. ${b.totalCost?.toLocaleString() || "0"}`,
          image: b.circuitBungalow.image,
        };
      });

      // Merge and show real database bookings first, followed by mock history
      setBookings([...formattedDbBookings, ...INITIAL_BOOKINGS]);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (id.startsWith("BKG")) {
      // Local fallback for mock bookings
      setBookings(bookings.map(b => b.id === id ? { ...b, status: "Cancelled" } : b));
      setMenuOpenId(null);
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: "CANCELLED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      fetchBookings();
      setMenuOpenId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to cancel reservation.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Bookings</h1>
        <p className="text-slate-500 mb-8">Manage your upcoming stays and view your past booking history.</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible relative">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-5">Accommodation</div>
            <div className="col-span-3">Dates</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
          </div>
          
          {/* Booking Rows */}
          <div className="divide-y divide-slate-100">
            {bookings.map(booking => (
              <div key={booking.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img src={booking.image} alt={booking.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{booking.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">{booking.bookingId || booking.id}</p>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-slate-600 font-medium">
                  {booking.date}
                </div>
                <div className="col-span-2 font-bold text-slate-800 text-sm">
                  {booking.amount}
                </div>
                <div className="col-span-2 flex items-center justify-between relative">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                    booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                    booking.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 
                    'bg-red-100 text-red-700' // For Cancelled or Rejected
                  }`}>
                    {booking.status}
                  </span>
                  
                  {/* Action Menu Toggle */}
                  <button 
                    onClick={() => setMenuOpenId(menuOpenId === booking.id ? null : booking.id)}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-2 cursor-pointer relative z-10"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
 
                  {/* Dropdown Menu */}
                  {menuOpenId === booking.id && (
                    <div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        View Receipt
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">contact_support</span>
                        Contact Support
                      </button>
                      {(booking.status === "Confirmed" || booking.status === "Pending") && (
                        <>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Cancel Booking
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
