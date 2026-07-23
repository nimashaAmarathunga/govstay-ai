"use client";

import React from "react";

const BOOKINGS = [
  {
    id: "BKG-2024-892",
    title: "Nuwara Eliya Rest House",
    date: "Sept 14 - Sept 16, 2024",
    status: "Confirmed",
    amount: "Rs. 38,200",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
  },
  {
    id: "BKG-2024-710",
    title: "Galle Fort Heritage Bungalow",
    date: "Aug 02 - Aug 05, 2024",
    status: "Completed",
    amount: "Rs. 67,500",
    image: "https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "BKG-2023-112",
    title: "Kandy Lake View Circuit",
    date: "Dec 10 - Dec 12, 2023",
    status: "Completed",
    amount: "Rs. 31,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  }
];

export default function BookingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Bookings</h1>
        <p className="text-slate-500 mb-8">Manage your upcoming stays and view your past booking history.</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-5">Accommodation</div>
            <div className="col-span-3">Dates</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
          </div>
          
          {/* Booking Rows */}
          <div className="divide-y divide-slate-100">
            {BOOKINGS.map(booking => (
              <div key={booking.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img src={booking.image} alt={booking.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{booking.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">{booking.id}</p>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-slate-600 font-medium">
                  {booking.date}
                </div>
                <div className="col-span-2 font-bold text-slate-800 text-sm">
                  {booking.amount}
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                    booking.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {booking.status}
                  </span>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors p-2">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
