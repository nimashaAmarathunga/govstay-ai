import { prisma } from "@/lib/prisma";
import React from "react";

export const dynamic = "force-dynamic"; // ensure fresh data

export default async function AdminApprovalsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: true,
      circuitBungalow: true,
      room: true,
    },
  });

  const allSessions = await prisma.agentSession.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const sessions = allSessions.filter((s) => s.auditTrace != null).slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">AI Booking Approvals</h1>
            <p className="text-slate-500 mt-2">Monitor automated decisions made by the GovSewana Multi-Agent System.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 text-sm font-semibold shadow-sm">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            AI Agents Active
          </div>
        </header>

        {/* Section 1: Bookings */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">fact_check</span>
            Recent Decisions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.length === 0 ? (
              <p className="text-slate-500 italic">No bookings found yet.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  {/* Status Header */}
                  <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${
                      b.status === "CONFIRMED" ? "bg-emerald-50" : 
                      b.status === "REJECTED" ? "bg-red-50" : "bg-amber-50"
                  }`}>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      ID: {b.bookingId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      b.status === "CONFIRMED" ? "bg-emerald-200 text-emerald-800" : 
                      b.status === "REJECTED" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="p-5 flex-1">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{b.circuitBungalow.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">Room: {b.room.roomNumber} ({b.room.roomType})</p>
                    
                    <div className="flex flex-col gap-2 text-sm text-slate-700 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Employee:</span>
                        <span className="font-semibold">{b.user?.name || "Unknown"} (ID: {b.user?.empId || "N/A"})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dates:</span>
                        <span className="font-semibold">{b.fromDate.toLocaleDateString()} - {b.toDate.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">AI Reasoning</span>
                        {b.confidenceScore && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Confidence: {(b.confidenceScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg">
                        {b.approvalReason || "No automated reasoning recorded. (Draft/Manual Booking)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section 2: Audit Traces */}
        <section className="pt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">policy</span>
            Security & Audit Traces
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No agent sessions with audit traces found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <details key={s.id} className="group p-5 hover:bg-slate-50 transition-colors">
                    <summary className="cursor-pointer flex items-center justify-between font-semibold text-slate-800 list-none">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 transition-colors">history</span>
                        Session: {s.sessionId}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 font-normal">{s.updatedAt.toLocaleString()}</span>
                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                      </div>
                    </summary>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-xs text-emerald-400 font-mono">
                          {JSON.stringify(s.auditTrace, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
