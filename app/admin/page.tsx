"use client";

import React, { useState, useEffect } from "react";

// --- Types ---

type CaretakerForm = {
  name: string;
  address: string;
  telephoneNo: string;
  emailAddress: string;
};

type RoomForm = {
  id?: string;
  roomNumber: string;
  roomType: "AC" | "NON_AC";
  noOfBeds: number;
  price: number;
  items: string; // comma separated string for form handling
};

type BungalowFormState = {
  id?: string;
  slug?: string;
  name: string;
  location: string;
  department: string;
  capacity: number;
  noOfRooms: number;
  image: string;
  description: string;
  amenities: string; // comma separated string for form
  highlights: string; // comma separated string for form
  latitude?: string;
  longitude?: string;
  gmapLink?: string;
  caretaker: CaretakerForm;
  rooms: RoomForm[];
};

type DbRoom = {
  id: string;
  roomNumber: string;
  roomType: "AC" | "NON_AC";
  noOfBeds: number;
  price: number;
  items: string[];
};

type DbCaretaker = {
  id: string;
  name: string;
  address: string;
  telephoneNo: string;
  emailAddress?: string | null;
};

type DbBungalow = {
  id: string;
  slug: string;
  name: string;
  location: string;
  department: string;
  capacity: number;
  noOfRooms: number;
  image: string;
  description: string;
  rating: number;
  amenities: string[];
  highlights: string[];
  latitude?: number | null;
  longitude?: number | null;
  gmapLink?: string | null;
  caretaker?: DbCaretaker | null;
  rooms: DbRoom[];
};

type DbBooking = {
  id: string;
  bookingId: string;
  userId: string;
  fromDate: string;
  toDate: string;
  status: string;
  totalCost: number | null;
  circuitBungalow?: {
    name: string;
    location: string;
    image: string;
  };
  room?: {
    roomNumber: string;
    roomType: string;
    price: number;
  };
  user?: {
    name: string;
    empId?: string | null;
    placeOfWork?: string | null;
  };
};

const DEFAULT_FORM_STATE: BungalowFormState = {
  name: "",
  slug: "",
  location: "",
  department: "Ministry of Public Administration",
  capacity: 6,
  noOfRooms: 2,
  image: "https://images.unsplash.com/photo-1542314831-c6a4d14cdce8?auto=format&fit=crop&w=800&q=80",
  description: "",
  amenities: "Hot Water, Kitchen Facilities, Garden View",
  highlights: "Scenic Views, Quiet Atmosphere",
  caretaker: {
    name: "",
    address: "",
    telephoneNo: "",
    emailAddress: "",
  },
  rooms: [
    {
      roomNumber: "101",
      roomType: "NON_AC",
      noOfBeds: 2,
      price: 3000,
      items: "Double Bed, Ensuite Bathroom, Geyser",
    },
  ],
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"bungalows" | "bookings">("bungalows");

  // Data State
  const [bungalows, setBungalows] = useState<DbBungalow[]>([]);
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Bungalow
  const [isBungalowModalOpen, setIsBungalowModalOpen] = useState(false);
  const [editingBungalowId, setEditingBungalowId] = useState<string | null>(null);
  const [bungalowForm, setBungalowForm] = useState<BungalowFormState>(DEFAULT_FORM_STATE);

  // Fetch Data from APIs
  const fetchBungalows = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bungalows");
      const json = await res.json();
      if (json.success) {
        setBungalows(json.data);
      } else {
        setErrorMsg(json.error || "Failed to fetch bungalows");
      }
    } catch (err: any) {
      console.error("Error fetching bungalows:", err);
      setErrorMsg("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBungalows();
    fetchBookings();
  }, []);

  // --- Handlers ---
  const handleAddBungalow = () => {
    setBungalowForm(DEFAULT_FORM_STATE);
    setEditingBungalowId(null);
    setIsBungalowModalOpen(true);
  };

  const handleEditBungalow = (b: DbBungalow) => {
    setEditingBungalowId(b.id);
    setBungalowForm({
      id: b.id,
      name: b.name,
      slug: b.slug,
      location: b.location,
      department: b.department,
      capacity: b.capacity,
      noOfRooms: b.noOfRooms,
      image: b.image,
      description: b.description || "",
      amenities: b.amenities.join(", "),
      highlights: b.highlights.join(", "),
      latitude: b.latitude ? b.latitude.toString() : "",
      longitude: b.longitude ? b.longitude.toString() : "",
      gmapLink: b.gmapLink || "",
      caretaker: {
        name: b.caretaker?.name || "",
        address: b.caretaker?.address || "",
        telephoneNo: b.caretaker?.telephoneNo || "",
        emailAddress: b.caretaker?.emailAddress || "",
      },
      rooms: b.rooms.length > 0
        ? b.rooms.map((r) => ({
            id: r.id,
            roomNumber: r.roomNumber,
            roomType: r.roomType,
            noOfBeds: r.noOfBeds,
            price: r.price,
            items: r.items.join(", "),
          }))
        : [
            {
              roomNumber: "101",
              roomType: "NON_AC",
              noOfBeds: 2,
              price: 3000,
              items: "Double Bed, Hot Water",
            },
          ],
    });
    setIsBungalowModalOpen(true);
  };

  const handleDeleteBungalow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this circuit bungalow? This will also remove associated room and caretaker records.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/bungalows?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setBungalows((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(json.error || "Failed to delete bungalow");
      }
    } catch (err: any) {
      alert("Error deleting bungalow: " + err.message);
    }
  };

  const saveBungalow = async () => {
    if (!bungalowForm.name.trim() || !bungalowForm.location.trim()) {
      alert("Please fill in required fields: Bungalow Name and Location.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingBungalowId,
        name: bungalowForm.name,
        slug: bungalowForm.slug,
        location: bungalowForm.location,
        department: bungalowForm.department,
        capacity: Number(bungalowForm.capacity),
        noOfRooms: bungalowForm.rooms.length || Number(bungalowForm.noOfRooms),
        image: bungalowForm.image,
        description: bungalowForm.description,
        amenities: bungalowForm.amenities,
        highlights: bungalowForm.highlights,
        latitude: bungalowForm.latitude,
        longitude: bungalowForm.longitude,
        gmapLink: bungalowForm.gmapLink,
        caretaker: bungalowForm.caretaker,
        rooms: bungalowForm.rooms,
      };

      const method = editingBungalowId ? "PUT" : "POST";
      const res = await fetch("/api/admin/bungalows", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsBungalowModalOpen(false);
        fetchBungalows(); // Refresh list from DB
      } else {
        alert(json.error || "Failed to save bungalow");
      }
    } catch (err: any) {
      alert("Error saving bungalow: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Dynamic Room Handlers ---
  const handleAddRoomRow = () => {
    setBungalowForm((prev) => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        {
          roomNumber: `Room-${prev.rooms.length + 1}`,
          roomType: "NON_AC",
          noOfBeds: 2,
          price: 3000,
          items: "Double Bed, Hot Water",
        },
      ],
    }));
  };

  const handleRemoveRoomRow = (index: number) => {
    if (bungalowForm.rooms.length <= 1) {
      alert("At least one room is required for a bungalow.");
      return;
    }
    setBungalowForm((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
  };

  const handleRoomChange = (index: number, field: keyof RoomForm, value: any) => {
    setBungalowForm((prev) => {
      const updatedRooms = [...prev.rooms];
      updatedRooms[index] = {
        ...updatedRooms[index],
        [field]: value,
      };
      return { ...prev, rooms: updatedRooms };
    });
  };

  // Stats calculation
  const totalBungalows = bungalows.length;
  const totalRooms = bungalows.reduce((sum, b) => sum + (b.rooms?.length || b.noOfRooms || 0), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative min-h-screen">
      {/* Admin Header & Stats */}
      <div className="bg-white border-b border-slate-200 px-8 pt-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 mb-8">
          Manage circuit bungalows, caretaker details, room capacities, and view live system reservations.
        </p>

        {/* System Overview Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined">holiday_village</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Total Bungalows</p>
              <h3 className="text-2xl font-bold text-slate-800">{loading ? "..." : totalBungalows}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Configured Rooms</p>
              <h3 className="text-2xl font-bold text-slate-800">{loading ? "..." : totalRooms}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Total Bookings</p>
              <h3 className="text-2xl font-bold text-slate-800">{bookings.length}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl inline-flex mb-2">
          <button
            onClick={() => setActiveTab("bungalows")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "bungalows" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Circuit Bungalows ({bungalows.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "bookings" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Database Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {/* TAB: CIRCUIT BUNGALOWS */}
          {activeTab === "bungalows" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Manage Circuit Bungalows</h2>
                  <p className="text-xs text-slate-500">Live data synced with Database (`CircuitBungalow`, `Caretaker`, `Room`)</p>
                </div>
                <button
                  onClick={handleAddBungalow}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-semibold text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Bungalow
                </button>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Loading circuit bungalows from database...</p>
                </div>
              ) : bungalows.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">holiday_village</span>
                  <p className="text-base font-semibold text-slate-700">No Bungalows Found</p>
                  <p className="text-sm text-slate-500 mb-4">Click "Add Bungalow" to add your first circuit bungalow.</p>
                  <button
                    onClick={handleAddBungalow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                  >
                    Add New Bungalow
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <div className="col-span-4">Bungalow & Department</div>
                    <div className="col-span-3">Caretaker Details</div>
                    <div className="col-span-2 text-center">Rooms / Capacity</div>
                    <div className="col-span-3 text-right">Actions</div>
                  </div>

                  {bungalows.map((b) => {
                    const startingPrice = b.rooms?.length > 0 ? Math.min(...b.rooms.map((r) => r.price)) : 0;
                    return (
                      <div key={b.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/80 transition-colors">
                        <div className="col-span-4 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                            <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{b.name}</h3>
                            <p className="text-xs text-slate-500">{b.location}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md">
                              {b.department}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3">
                          {b.caretaker ? (
                            <div>
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                {b.caretaker.name}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                                {b.caretaker.telephoneNo || "N/A"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium italic">No caretaker assigned</span>
                          )}
                        </div>

                        <div className="col-span-2 text-center">
                          <p className="text-xs font-bold text-slate-800">{b.rooms?.length || b.noOfRooms} Rooms</p>
                          <p className="text-[11px] text-slate-500">Max {b.capacity} Guests</p>
                          {startingPrice > 0 && (
                            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">From Rs. {startingPrice}</p>
                          )}
                        </div>

                        <div className="col-span-3 flex justify-end gap-2">
                          <button
                            onClick={() => handleEditBungalow(b)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBungalow(b.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: DATABASE BOOKINGS */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Database Bookings</h2>
                  <p className="text-xs text-slate-500">Live booking reservations recorded in `Booking` model</p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                  <p className="text-base font-semibold text-slate-700">No Bookings Found in Database</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <div className="col-span-3">Booking ID & User</div>
                    <div className="col-span-3">Bungalow & Room</div>
                    <div className="col-span-3">Stay Dates</div>
                    <div className="col-span-3 text-right">Status & Total</div>
                  </div>

                  {bookings.map((b) => (
                    <div key={b.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-3">
                        <p className="text-xs font-mono font-bold text-blue-600">{b.bookingId}</p>
                        <p className="text-sm font-bold text-slate-800">{b.user?.name || "Guest User"}</p>
                        {b.user?.empId && <p className="text-xs text-slate-500">Emp ID: {b.user.empId}</p>}
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs font-bold text-slate-800">{b.circuitBungalow?.name || "Circuit Bungalow"}</p>
                        <p className="text-xs text-slate-500">
                          {b.room ? `${b.room.roomNumber} (${b.room.roomType})` : "General Room"}
                        </p>
                      </div>
                      <div className="col-span-3 text-xs text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-700">From:</span> {new Date(b.fromDate).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">To:</span> {new Date(b.toDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="col-span-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-700"
                              : b.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.totalCost && (
                          <p className="text-sm font-bold text-slate-800 mt-1">Rs. {b.totalCost.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT BUNGALOW MODAL --- */}
      {isBungalowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">domain</span>
                <h3 className="font-bold text-lg">{editingBungalowId ? "Edit Circuit Bungalow" : "Add New Circuit Bungalow"}</h3>
              </div>
              <button
                onClick={() => setIsBungalowModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* SECTION 1: CIRCUIT BUNGALOW GENERAL DETAILS */}
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  1. Bungalow Information (Model: CircuitBungalow)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bungalow Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Diyatalawa Holiday Rest"
                      value={bungalowForm.name}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, name: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Ministry of Public Administration"
                      value={bungalowForm.department}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, department: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location / Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Diyatalawa, Uva Province"
                      value={bungalowForm.location}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, location: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Guest Capacity</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      value={bungalowForm.capacity}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, capacity: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="https://images.unsplash.com/..."
                      value={bungalowForm.image}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, image: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description / Overview</label>
                    <textarea
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Overview of the bungalow premises..."
                      value={bungalowForm.description}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, description: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amenities (comma separated)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="Hot Water, Kitchen, Garden"
                      value={bungalowForm.amenities}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, amenities: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Highlights (comma separated)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="Near Station, Scenic Views"
                      value={bungalowForm.highlights}
                      onChange={(e) => setBungalowForm({ ...bungalowForm, highlights: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CARETAKER DETAILS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  2. Caretaker Details (Model: Caretaker)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Caretaker Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. K. A. Perera"
                      value={bungalowForm.caretaker.name}
                      onChange={(e) =>
                        setBungalowForm({
                          ...bungalowForm,
                          caretaker: { ...bungalowForm.caretaker, name: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telephone Number</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. +94 77 1234567"
                      value={bungalowForm.caretaker.telephoneNo}
                      onChange={(e) =>
                        setBungalowForm({
                          ...bungalowForm,
                          caretaker: { ...bungalowForm.caretaker, telephoneNo: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Circuit Bungalow Quarters, Diyatalawa"
                      value={bungalowForm.caretaker.address}
                      onChange={(e) =>
                        setBungalowForm({
                          ...bungalowForm,
                          caretaker: { ...bungalowForm.caretaker, address: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                      placeholder="caretaker@govstay.lk"
                      value={bungalowForm.caretaker.emailAddress}
                      onChange={(e) =>
                        setBungalowForm({
                          ...bungalowForm,
                          caretaker: { ...bungalowForm.caretaker, emailAddress: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ROOM DETAILS */}
              <div>
                <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">bed</span>
                    3. Room Details (Model: Room)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddRoomRow}
                    className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Room
                  </button>
                </div>

                <div className="space-y-3">
                  {bungalowForm.rooms.map((room, idx) => (
                    <div key={idx} className="bg-purple-50/40 border border-purple-100 rounded-xl p-4 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-purple-900">Room #{idx + 1}</span>
                        {bungalowForm.rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoomRow(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Room Number / Code</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                            placeholder="e.g. 101"
                            value={room.roomNumber}
                            onChange={(e) => handleRoomChange(idx, "roomNumber", e.target.value)}
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Room Type</label>
                          <select
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                            value={room.roomType}
                            onChange={(e) => handleRoomChange(idx, "roomType", e.target.value as "AC" | "NON_AC")}
                          >
                            <option value="NON_AC">Non-AC</option>
                            <option value="AC">AC</option>
                          </select>
                        </div>

                        <div className="col-span-12 sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Beds Count</label>
                          <input
                            type="number"
                            min={1}
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                            value={room.noOfBeds}
                            onChange={(e) => handleRoomChange(idx, "noOfBeds", parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="col-span-12 sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Price / Night (Rs.)</label>
                          <input
                            type="number"
                            step="100"
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                            value={room.price}
                            onChange={(e) => handleRoomChange(idx, "price", parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Room Items & Amenities (comma separated)
                          </label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                            placeholder="Double Bed, Geyser, Wardrobe, Ensuite Bathroom"
                            value={room.items}
                            onChange={(e) => handleRoomChange(idx, "items", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBungalowModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveBungalow}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Bungalow Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
