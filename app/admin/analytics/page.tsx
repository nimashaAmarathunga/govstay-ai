"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/context/UserContext";
import { motion } from "framer-motion";
import {
  ArrowLeft, RefreshCw, BarChart3, Building2, Users, Hotel, BedDouble, 
  MapPin, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

type AnalyticsData = {
  overview: {
    totalBungalows: number;
    totalRooms: number;
    totalBookings: number;
    totalUsers: number;
    totalDepartments: number;
  };
  bookingTrends: { date: string; count: number }[];
  bookingStatuses: { name: string; value: number }[];
  userStats: { name: string; value: number }[];
  paymentStats: { name: string; value: number }[];
  topBungalows: { id: string; name: string; location: string; department: string; bookings: number }[];
  destinationStats: { location: string; bungalows: number; bookings: number }[];
  departmentStats: { department: string; bungalows: number; rooms: number; bookings: number; confirmed: number; cancelled: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#eab308", // yellow-500
  CONFIRMED: "#10b981", // emerald-500
  REJECTED: "#f43f5e", // rose-500
  CANCELLED: "#64748b", // slate-500
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { activeUser } = useUser();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("last6months");

  useEffect(() => {
    if (!activeUser) return;
    if (activeUser.role !== "SUPER_ADMIN") {
      router.push("/admin");
    } else {
      fetchAnalytics();
    }
  }, [activeUser, router, period]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load analytics");
      }
    } catch (err) {
      setError("An error occurred while fetching analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!activeUser || activeUser.role !== "SUPER_ADMIN") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-sm mt-3 font-semibold text-slate-600">Verifying authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFDFD] relative">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <button 
              onClick={() => router.push("/admin")}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Government Analytics</h1>
                <p className="text-[14px] text-slate-500 font-medium mt-0.5">
                  Centralized insights into government bungalow usage and booking activity.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200/80 shadow-sm rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last3months">Last 3 Months</option>
              <option value="last6months">Last 6 Months</option>
              <option value="last12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={fetchAnalytics}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-800 text-emerald-900 hover:bg-emerald-50 shadow-sm rounded-lg text-sm font-medium transition-all disabled:opacity-50 hover:brightness-95 active:scale-[0.99]"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#21263A]" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-md flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
            <button onClick={fetchAnalytics} className="ml-auto underline font-bold text-sm">Try Again</button>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && !error && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-md border border-slate-200"></div>
            ))}
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-slate-200/80 transition-transform hover:-translate-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-emerald-700"/> Total Bungalows</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{data.overview.totalBungalows}</h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-slate-200/80 transition-transform hover:-translate-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-emerald-700"/> Total Rooms</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{data.overview.totalRooms}</h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-slate-200/80 transition-transform hover:-translate-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-700"/> Total Bookings</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{data.overview.totalBookings}</h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-slate-200/80 transition-transform hover:-translate-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-700"/> Total Users</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{data.overview.totalUsers}</h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] border border-slate-200/80 transition-transform hover:-translate-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-emerald-700"/> Active Depts</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{data.overview.totalDepartments}</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Booking Trends Line Chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-6 tracking-wide">
                  Booking Trends ({
                    period === "last7days" ? "Last 7 Days" :
                    period === "last30days" ? "Last 30 Days" :
                    period === "last3months" ? "Last 3 Months" :
                    period === "last6months" ? "Last 6 Months" :
                    period === "last12months" ? "Last 12 Months" : "All Time"
                  })
                </h3>
                <div className="h-[300px] w-full">
                  {data.bookingTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.bookingTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <Line type="monotone" dataKey="count" stroke="#157954" strokeWidth={3} dot={{ r: 4, fill: "#157954" }} activeDot={{ r: 6 }} />
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">No booking data available.</div>
                  )}
                </div>
              </div>

              {/* Booking Status Distribution */}
              <div className="bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4 tracking-wide">Booking Status</h3>
                <div className="h-[300px] w-full">
                  {data.bookingStatuses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.bookingStatuses}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.bookingStatuses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">No status data available.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Row Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Department Performance */}
              <div className="bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-base font-semibold text-slate-900 tracking-wide">Department Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-50/30 text-[11px] uppercase tracking-wider text-slate-600 font-medium border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3">Department</th>
                        <th className="px-5 py-3 text-right">Bungalows</th>
                        <th className="px-5 py-3 text-right">Rooms</th>
                        <th className="px-5 py-3 text-right">Bookings</th>
                        <th className="px-5 py-3 text-right">Confirmed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.departmentStats.map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-slate-800">{dept.department}</td>
                          <td className="px-5 py-3 text-right text-slate-600">{dept.bungalows}</td>
                          <td className="px-5 py-3 text-right text-slate-600">{dept.rooms}</td>
                          <td className="px-5 py-3 text-right font-bold text-slate-900">{dept.bookings}</td>
                          <td className="px-5 py-3 text-right text-emerald-700 font-semibold">{dept.confirmed}</td>
                        </tr>
                      ))}
                      {data.departmentStats.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No department data available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Most Booked Bungalows & Destinations */}
              <div className="flex flex-col gap-6">
                <div className="bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] p-5">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 tracking-wide">Most Booked Bungalows</h3>
                  <div className="space-y-4">
                    {data.topBungalows.map((b, idx) => (
                      <div key={b.id} className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">#{idx + 1}</div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-emerald-700"/>{b.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 bg-emerald-50 px-2.5 py-1 rounded-md shadow-sm border border-emerald-100">{b.bookings}</span>
                        </div>
                      </div>
                    ))}
                    {data.topBungalows.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-4">No bookings yet.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
