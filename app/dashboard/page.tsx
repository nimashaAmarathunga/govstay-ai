"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/components/context/UserContext";
import { User, CalendarDays, Sparkles, LogOut, FileCheck2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { activeUser, checkAuthSession } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await checkAuthSession();
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (!activeUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {activeUser.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            @{activeUser.username} {activeUser.empId ? `| Employee ID: ${activeUser.empId}` : ""}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-bold shadow-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Bookings Card */}
        <Link href="/bookings" className="group p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all hover:border-blue-300">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">My Bookings</h3>
          <p className="text-xs text-slate-500">View and manage your bungalow reservations and track statuses.</p>
        </Link>

        {/* Profile Card */}
        <Link href="/profile" className="group p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all hover:emerald-300">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">My Profile</h3>
          <p className="text-xs text-slate-500">Update your personal details, department, and contact information.</p>
        </Link>

        {/* ID Upload / Verification Card */}
        <Link href="/id-upload" className="group p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all hover:amber-300">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Identity Verification</h3>
          <p className="text-xs text-slate-500">Upload your government ID for faster booking approvals.</p>
        </Link>

        {/* Support Assistant Card */}
        <Link href="/agent" className="group p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-md hover:shadow-lg transition-all hover:bg-slate-800 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Help & Support</h3>
          <p className="text-xs text-slate-400">Get assistance and manage bookings through our support desk.</p>
        </Link>
      </div>
    </div>
  );
}
