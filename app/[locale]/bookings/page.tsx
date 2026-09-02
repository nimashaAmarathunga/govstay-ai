"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Calendar, CreditCard, MoreVertical, FileText,
  HelpCircle, XCircle, Search, Clock, CheckCircle2,
  AlertCircle, Paperclip, Loader2, Sparkles
} from "lucide-react";
import { useUser } from "@/components/context/UserContext";

export default function BookingsPage() {
  const t = useTranslations("Bookings");
  const tCommon = useTranslations("Common");
  const [bookings, setBookings] = useState<any[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { activeUser } = useUser();

  const fetchBookings = async () => {
    if (!activeUser) return;
    try {
      const res = await fetch(`/api/bookings?userId=${activeUser.id}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      
      const groups: { [key: string]: any[] } = {};
      (data || []).forEach((b: any) => {
        const fromTime = new Date(b.fromDate).getTime();
        const toTime = new Date(b.toDate).getTime();
        const createdTime = new Date(b.createdAt).getTime();

        let foundGroupKey = null;
        for (const key of Object.keys(groups)) {
          const firstInGroup = groups[key][0];
          const grpFromTime = new Date(firstInGroup.fromDate).getTime();
          const grpToTime = new Date(firstInGroup.toDate).getTime();
          const grpCreatedTime = new Date(firstInGroup.createdAt).getTime();

          if (
            firstInGroup.circuitBungalowId === b.circuitBungalowId &&
            grpFromTime === fromTime &&
            grpToTime === toTime &&
            Math.abs(grpCreatedTime - createdTime) < 5000
          ) {
            foundGroupKey = key;
            break;
          }
        }

        if (foundGroupKey) {
          groups[foundGroupKey].push(b);
        } else {
          groups[b.id] = [b];
        }
      });

      const formattedDbBookings = Object.values(groups).map((group: any[]) => {
        const first = group[0];
        const from = new Date(first.fromDate);
        const to = new Date(first.toDate);
        const dateStr = `${from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

        let displayStatus = "Pending";
        if (first.status === "CONFIRMED") displayStatus = "Confirmed";
        if (first.status === "CANCELLED") displayStatus = "Cancelled";
        if (first.status === "REJECTED") displayStatus = "Rejected";

        const totalCost = group.reduce((sum, b) => sum + (b.totalCost || 0), 0);
        const roomNumbers = group.map((b) => b.room.roomNumber).sort().join(", ");
        
        return {
          id: first.id,
          ids: group.map(b => b.id),
          bookingId: first.bookingId || first.id.substring(0, 8).toUpperCase(),
          title: first.circuitBungalow.name,
          date: dateStr,
          status: displayStatus,
          statusCode: first.status,
          amount: `LKR ${totalCost.toLocaleString()}`,
          image: first.circuitBungalow.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          paymentSlipUrl: first.paymentSlipUrl,
          approvalReason: first.approvalReason,
          roomNumbers
        };
      });

      setBookings(formattedDbBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeUser]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm(t("cancelBooking") + "?")) return;
    const bookingGroup = bookings.find((b) => b.id === id);
    const idsToCancel = bookingGroup && bookingGroup.ids ? bookingGroup.ids : [id];

    try {
      await Promise.all(idsToCancel.map((bookingId: string) => 
        fetch("/api/bookings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: bookingId,
            status: "CANCELLED",
          }),
        })
      ));

      fetchBookings();
      setMenuOpenId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to cancel reservation.");
    }
  };

  const getStatusBadge = (booking: any) => {
    const status = booking.status;
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("confirmed")}
          </span>
        );
      case 'Pending':
        const reasonText = booking.approvalReason || "Verifying...";
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t("pending")}
            </span>
            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1 max-w-[200px] text-right">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{reasonText}</span>
            </span>
          </div>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            {t("completed")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/60">
            <AlertCircle className="w-3.5 h-3.5" />
            {t("cancelled")}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFDFD] relative">
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">{t("title")}</h1>
              <p className="text-[15px] text-slate-500 font-medium">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-visible relative">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 rounded-t-[24px]">
              <div className="col-span-5">{tCommon("viewDetails")}</div>
              <div className="col-span-3">{t("dates")}</div>
              <div className="col-span-2">{t("totalAmount")}</div>
              <div className="col-span-2">{t("status")}</div>
            </div>
            
            <div className="divide-y divide-slate-100/80">
              {bookings.map((booking, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={booking.id} 
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4 px-6 py-6 md:px-8 items-center hover:bg-slate-50/50 transition-colors group relative"
                >
                  <div className="col-span-1 md:col-span-5 flex items-center gap-5">
                    <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm relative">
                      <img src={booking.image} alt={booking.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px] mb-1 group-hover:text-slate-700 transition-colors line-clamp-1">{booking.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {booking.bookingId || booking.id.substring(0,8)}
                        </span>
                        {booking.paymentSlipUrl && (
                          <a
                            href={booking.paymentSlipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 hover:bg-blue-100 transition-colors"
                          >
                            <Paperclip className="w-3 h-3" />
                            Slip Attached
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 text-[13.5px] text-slate-600 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 md:hidden" />
                    {booking.date}
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 font-bold text-slate-900 text-[15px] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400 md:hidden" />
                    {booking.amount}
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end relative mt-2 md:mt-0">
                    <div className="flex-1 md:flex-none">
                      {getStatusBadge(booking)}
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === booking.id ? null : booking.id);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative z-10 cursor-pointer ml-2 md:ml-4
                        ${menuOpenId === booking.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}
                      `}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
   
                    <AnimatePresence>
                      {menuOpenId === booking.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setMenuOpenId(null)} 
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 md:right-10 top-14 md:top-10 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden origin-top-right"
                          >
                            {booking.paymentSlipUrl && (
                              <a
                                href={booking.paymentSlipUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3 cursor-pointer"
                              >
                                <Paperclip className="w-4 h-4 text-slate-400" />
                                {t("downloadSlip")}
                              </a>
                            )}
                            {(booking.status === "Confirmed" || booking.status === "Pending") && (
                              <>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  {t("cancelBooking")}
                                </button>
                              </>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
              
              {bookings.length === 0 && (
                <div className="py-24 text-center px-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{t("noBookingsTitle")}</h3>
                  <p className="text-slate-500 text-[14px]">{t("noBookingsDesc")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
