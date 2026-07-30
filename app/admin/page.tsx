"use client";

import React, { useState } from "react";

// --- Types & Initial Data ---

type Bungalow = {
  id: string;
  title: string;
  location: string;
  rooms: number;
  capacityPerRoom: number;
  price: string;
  facilities: string[];
  details: string;
  image: string;
};

type Booking = {
  id: string;
  userId: string;
  place: string;
  rooms: number;
  nights: number;
  totalCost: string;
};



const INITIAL_BUNGALOWS: Bungalow[] = [
  {
    id: "B-1",
    title: "Nuwara Eliya Rest House",
    location: "Nuwara Eliya, Central Province",
    rooms: 5,
    capacityPerRoom: 2,
    price: "18,500",
    facilities: ["Garden View", "Fireplace", "Steward Service"],
    details: "A secluded setting with colonial architecture.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
  },
  {
    id: "B-2",
    title: "Galle Fort Heritage Bungalow",
    location: "Galle, Southern Province",
    rooms: 3,
    capacityPerRoom: 3,
    price: "22,000",
    facilities: ["Ocean View", "Historical", "AC"],
    details: "Experience the history of Galle Fort.",
    image: "https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "BKG-2024-892",
    userId: "USR-001",
    place: "Nuwara Eliya Rest House",
    rooms: 1,
    nights: 2,
    totalCost: "37,000",
  },
  {
    id: "BKG-2024-905",
    userId: "USR-089",
    place: "Galle Fort Heritage Bungalow",
    rooms: 2,
    nights: 3,
    totalCost: "132,000",
  }
];




export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"bungalows" | "bookings" | "keepers">("bungalows");

  // State for data
  const [bungalows, setBungalows] = useState<Bungalow[]>(INITIAL_BUNGALOWS);
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS); // Bookings are view-only here as requested


  // Form State for Bungalow
  const [isBungalowModalOpen, setIsBungalowModalOpen] = useState(false);
  const [editingBungalowId, setEditingBungalowId] = useState<string | null>(null);
  const [bungalowForm, setBungalowForm] = useState<Partial<Bungalow>>({});



  // --- Bungalow Handlers ---
  const handleAddBungalow = () => {
    setBungalowForm({
      title: "", location: "", rooms: 1, capacityPerRoom: 2, price: "", facilities: [], details: "", image: ""
    });
    setEditingBungalowId(null);
    setIsBungalowModalOpen(true);
  };

  const handleEditBungalow = (b: Bungalow) => {
    setBungalowForm({ ...b });
    setEditingBungalowId(b.id);
    setIsBungalowModalOpen(true);
  };

  const handleDeleteBungalow = (id: string) => {
    setBungalows(bungalows.filter(b => b.id !== id));
  };

  const saveBungalow = () => {
    if (editingBungalowId) {
      setBungalows(bungalows.map(b => b.id === editingBungalowId ? { ...b, ...bungalowForm } as Bungalow : b));
    } else {
      const newBungalow = {
        ...bungalowForm,
        id: `B-${Date.now()}`,
        image: bungalowForm.image || "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      } as Bungalow;
      setBungalows([...bungalows, newBungalow]);
    }
    setIsBungalowModalOpen(false);
  };









  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">

      {/* Admin Header & Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 pt-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 mb-8">Manage properties, view confirmed bookings, and update staff assignments.</p>

        {/* Weekly Bookings Dashboard */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Upcoming Week Bookings</h3>
            <p className="text-sm text-slate-500 mb-6">Distribution of reservations for the next 7 days.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-semibold text-slate-700">Nuwara Eliya Rest House</span>
                </div>
                <span className="text-sm font-bold text-slate-800">15 bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-slate-700">Galle Fort Heritage</span>
                </div>
                <span className="text-sm font-bold text-slate-800">8 bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-semibold text-slate-700">Kandy Lake View</span>
                </div>
                <span className="text-sm font-bold text-slate-800">12 bookings</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Total upcoming</span>
              <span className="text-xl font-bold text-slate-800">35</span>
            </div>
          </div>

          {/* Pie Chart Visualization (CSS Conic Gradient) */}
          <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full shadow-inner"
              style={{
                background: 'conic-gradient(#3b82f6 0% 43%, #10b981 43% 66%, #f59e0b 66% 100%)'
              }}
            ></div>
            {/* Inner circle to make it a donut chart for a modern look */}
            <div className="absolute inset-4 bg-slate-50 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-3xl font-bold text-slate-800">35</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl inline-flex mb-2">
          <button
            onClick={() => setActiveTab("bungalows")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "bungalows" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Circuit Bungalows
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "bookings" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Confirmed Bookings
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">

          {/* TAB: BUNGALOWS */}
          {activeTab === "bungalows" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Manage Circuit Bungalows</h2>
                <button
                  onClick={handleAddBungalow}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-semibold text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Bungalow
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <div className="col-span-4">Place & Location</div>
                  <div className="col-span-2 text-center">Rooms</div>
                  <div className="col-span-2 text-center">Persons/Room</div>
                  <div className="col-span-2">Cost/Night</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {bungalows.map(b => (
                    <div key={b.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{b.title}</h3>
                          <p className="text-xs text-slate-500">{b.location}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-center text-sm font-medium text-slate-700">{b.rooms}</div>
                      <div className="col-span-2 text-center text-sm font-medium text-slate-700">{b.capacityPerRoom}</div>
                      <div className="col-span-2 text-sm font-bold text-blue-600">Rs. {b.price}</div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button onClick={() => handleEditBungalow(b)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => handleDeleteBungalow(b.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {bungalows.length === 0 && <div className="p-8 text-center text-slate-500">No bungalows added yet.</div>}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS (CONFIRMED ONLY) */}
          {activeTab === "bookings" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Confirmed Bookings Overview</h2>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <div className="col-span-2">User ID</div>
                  <div className="col-span-4">Booking Place</div>
                  <div className="col-span-2 text-center">Rooms</div>
                  <div className="col-span-2 text-center">Nights</div>
                  <div className="col-span-2 text-right">Total Cost</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {bookings.map(b => (
                    <div key={b.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 text-sm font-mono font-medium text-slate-600">{b.userId}</div>
                      <div className="col-span-4 text-sm font-bold text-slate-800">{b.place}</div>
                      <div className="col-span-2 text-center text-sm font-medium text-slate-700">{b.rooms}</div>
                      <div className="col-span-2 text-center text-sm font-medium text-slate-700">{b.nights}</div>
                      <div className="col-span-2 text-right text-sm font-bold text-emerald-600">Rs. {b.totalCost}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Bungalow Modal */}
      {isBungalowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{editingBungalowId ? "Edit Bungalow" : "Add New Bungalow"}</h3>
              <button onClick={() => setIsBungalowModalOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" placeholder="e.g. Nuwara Eliya Rest House" value={bungalowForm.title || ""} onChange={e => setBungalowForm({ ...bungalowForm, title: e.target.value })} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" placeholder="e.g. Nuwara Eliya" value={bungalowForm.location || ""} onChange={e => setBungalowForm({ ...bungalowForm, location: e.target.value })} />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Number of Rooms</label>
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" value={bungalowForm.rooms || 1} onChange={e => setBungalowForm({ ...bungalowForm, rooms: parseInt(e.target.value) })} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Persons per Room</label>
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" value={bungalowForm.capacityPerRoom || 2} onChange={e => setBungalowForm({ ...bungalowForm, capacityPerRoom: parseInt(e.target.value) })} />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cost for one night (Rs.)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" placeholder="e.g. 18,500" value={bungalowForm.price || ""} onChange={e => setBungalowForm({ ...bungalowForm, price: e.target.value })} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Facilities (comma separated)</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" placeholder="e.g. AC, WiFi, Hot Water" value={bungalowForm.facilities?.join(", ") || ""} onChange={e => setBungalowForm({ ...bungalowForm, facilities: e.target.value.split(",").map(s => s.trim()) })} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Additional Details</label>
                  <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-none" placeholder="Description of the place..." value={bungalowForm.details || ""} onChange={e => setBungalowForm({ ...bungalowForm, details: e.target.value })} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Photos (URL for now)</label>
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" placeholder="https://image-url..." value={bungalowForm.image || ""} onChange={e => setBungalowForm({ ...bungalowForm, image: e.target.value })} />
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">upload</span> Upload
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsBungalowModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Cancel</button>
              <button onClick={saveBungalow} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 cursor-pointer">Save Bungalow</button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
