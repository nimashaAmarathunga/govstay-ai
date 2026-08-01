"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/context/UserContext";
import { 
  Building2, Users, CalendarDays, Plus, Search,
  Edit2, Trash2, X, Save, AlertCircle, Loader2,
  Home, Phone, MapPin, BedDouble, FileText, CheckCircle2,
  Hotel
} from "lucide-react";

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
    department?: string;
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
  const { activeUser } = useUser();
  const [activeTab, setActiveTab] = useState<"bungalows" | "bookings">("bungalows");

  // Determine active department filter (DEPT_ADMIN filters by placeOfWork, SUPER_ADMIN sees all)
  const adminDepartment = (activeUser && activeUser.role === "DEPT_ADMIN" && activeUser.placeOfWork)
    ? activeUser.placeOfWork
    : null;

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
      const url = adminDepartment
        ? `/api/admin/bungalows?department=${encodeURIComponent(adminDepartment)}`
        : "/api/admin/bungalows";
      const res = await fetch(url);
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
      const url = adminDepartment
        ? `/api/admin/bookings?department=${encodeURIComponent(adminDepartment)}`
        : "/api/admin/bookings";
      const res = await fetch(url);
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
  }, [adminDepartment]);

  // --- Handlers ---
  const handleAddBungalow = () => {
    setBungalowForm({
      ...DEFAULT_FORM_STATE,
      department: adminDepartment || DEFAULT_FORM_STATE.department,
    });
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFDFD] relative">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Admin Dashboard</h1>
              <p className="text-[15px] text-slate-500 font-medium">
                Manage circuit bungalows, rooms, caretakers, and view live system reservations.
              </p>
            </div>
            {activeUser && (
              <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3.5 self-start md:self-auto border border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                  {activeUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white leading-tight flex items-center gap-2">
                    {activeUser.name}
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeUser.role === "SUPER_ADMIN" ? "Super Admin" : "Dept Admin"}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-400 font-medium mt-0.5">
                    {adminDepartment ? `Department: ${adminDepartment}` : "All Departments Access"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Hotel className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Bungalows</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{loading ? "..." : totalBungalows}</h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Configured Rooms</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{loading ? "..." : totalRooms}</h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Bookings</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{bookings.length}</h3>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl inline-flex mb-8 border border-slate-100 shadow-inner">
            <button
              onClick={() => setActiveTab("bungalows")}
              className={`px-6 py-2.5 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "bungalows" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Circuit Bungalows ({bungalows.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2.5 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "bookings" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All Reservations ({bookings.length})
            </button>
          </div>

          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-[14px] font-semibold">{errorMsg}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "bungalows" && (
              <motion.div key="bungalows" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Manage Circuit Bungalows</h2>
                  </div>
                  <button
                    onClick={handleAddBungalow}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg font-bold text-[14px] cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Add Bungalow
                  </button>
                </div>

                {loading ? (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-24 text-center text-slate-500 flex flex-col items-center justify-center gap-4 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    <p className="text-[15px] font-medium text-slate-600">Loading data...</p>
                  </div>
                ) : bungalows.length === 0 ? (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-24 text-center text-slate-500 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Hotel className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-2">No Bungalows Found</p>
                    <p className="text-[15px] text-slate-500 mb-6 max-w-sm">You haven't added any circuit bungalows to the system yet.</p>
                    <button
                      onClick={handleAddBungalow}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Bungalow
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="col-span-4">Bungalow Details</div>
                      <div className="col-span-3">Caretaker Info</div>
                      <div className="col-span-2 text-center">Rooms / Capacity</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {bungalows.map((b) => {
                        const startingPrice = b.rooms?.length > 0 ? Math.min(...b.rooms.map((r) => r.price)) : 0;
                        return (
                          <div key={b.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 items-center hover:bg-slate-50/50 transition-colors">
                            <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-1">{b.name}</h3>
                                <p className="text-[13px] text-slate-500 flex items-center gap-1 mb-1.5 font-medium">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {b.location}
                                </p>
                                <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                                  {b.department.split(" ")[0]}...
                                </span>
                              </div>
                            </div>

                            <div className="col-span-1 md:col-span-3">
                              {b.caretaker ? (
                                <div className="space-y-1.5">
                                  <p className="text-[13.5px] font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    {b.caretaker.name}
                                  </p>
                                  <p className="text-[13px] text-slate-500 flex items-center gap-2 font-medium">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {b.caretaker.telephoneNo || "N/A"}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[13px] text-amber-600 font-medium italic flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" /> Unassigned
                                </span>
                              )}
                            </div>

                            <div className="col-span-1 md:col-span-2 text-left md:text-center mt-2 md:mt-0">
                              <p className="text-[14px] font-bold text-slate-900 mb-0.5">{b.rooms?.length || b.noOfRooms} Rooms</p>
                              <p className="text-[12px] font-medium text-slate-500 mb-1">Max {b.capacity} Guests</p>
                              {startingPrice > 0 && (
                                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md">
                                  From LKR {startingPrice}
                                </span>
                              )}
                            </div>

                            <div className="col-span-1 md:col-span-3 flex justify-start md:justify-end gap-3 mt-4 md:mt-0">
                              <button
                                onClick={() => handleEditBungalow(b)}
                                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border border-slate-200 hover:border-slate-300"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBungalow(b.id)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer border border-slate-200 hover:border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Database Reservations</h2>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-24 text-center text-slate-500 flex flex-col items-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-2">No Bookings Found</p>
                    <p className="text-[15px] font-medium text-slate-500">The database currently has no booking records.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="col-span-3">Booking Reference</div>
                      <div className="col-span-3">Accommodation</div>
                      <div className="col-span-3">Dates</div>
                      <div className="col-span-3 text-right">Status / Value</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {bookings.map((b) => (
                        <div key={b.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 items-center hover:bg-slate-50/50 transition-colors">
                          <div className="col-span-1 md:col-span-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[11px] font-mono font-medium">
                                {b.bookingId}
                              </span>
                            </div>
                            <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {b.user?.name || "Guest User"}
                            </p>
                            {b.user?.empId && <p className="text-[12px] font-medium text-slate-500 mt-0.5 ml-5.5">Emp ID: {b.user.empId}</p>}
                          </div>
                          
                          <div className="col-span-1 md:col-span-3">
                            <p className="text-[14px] font-bold text-slate-900 flex items-center gap-2 mb-1">
                              <Hotel className="w-3.5 h-3.5 text-slate-400" />
                              {b.circuitBungalow?.name || "Circuit Bungalow"}
                            </p>
                            <p className="text-[13px] font-medium text-slate-500 ml-5.5">
                              {b.room ? `${b.room.roomNumber} (${b.room.roomType})` : "General Stay"}
                            </p>
                          </div>
                          
                          <div className="col-span-1 md:col-span-3">
                            <div className="text-[13px] font-medium text-slate-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                {new Date(b.fromDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                {new Date(b.toDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-1 md:col-span-3 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end mt-2 md:mt-0">
                            <span
                              className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1.5 ${
                                b.status === "CONFIRMED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : b.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {b.status}
                            </span>
                            {b.totalCost && (
                              <p className="text-[15px] font-extrabold text-slate-900">LKR {b.totalCost.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- ADD / EDIT BUNGALOW MODAL --- */}
      <AnimatePresence>
        {isBungalowModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsBungalowModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] relative z-10"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <Building2 className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">
                      {editingBungalowId ? "Edit Circuit Bungalow" : "Add Circuit Bungalow"}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-500">
                      Update details, caretaker information, and room configurations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBungalowModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar bg-slate-50/30">
                
                {/* SECTION 1 */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[12px]">1</div>
                    Bungalow Information
                  </h4>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Bungalow Name *</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="e.g. Diyatalawa Holiday Rest"
                        value={bungalowForm.name}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, name: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Department *</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="e.g. Ministry of Public Administration"
                        value={bungalowForm.department}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, department: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Location / Address *</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="e.g. Diyatalawa, Uva Province"
                        value={bungalowForm.location}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, location: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Guest Capacity</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        value={bungalowForm.capacity}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, capacity: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Cover Image URL</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="https://images.unsplash.com/..."
                        value={bungalowForm.image}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, image: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Description Overview</label>
                      <textarea
                        rows={3}
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all resize-none"
                        placeholder="Overview of the bungalow premises..."
                        value={bungalowForm.description}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, description: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Amenities (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="Hot Water, Kitchen, Garden"
                        value={bungalowForm.amenities}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, amenities: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Highlights (comma separated)</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="Near Station, Scenic Views"
                        value={bungalowForm.highlights}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, highlights: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[12px]">2</div>
                    Caretaker Details
                  </h4>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="e.g. K. A. Perera"
                        value={bungalowForm.caretaker.name}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, caretaker: { ...bungalowForm.caretaker, name: e.target.value }})}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Telephone Number</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="e.g. +94 77 1234567"
                        value={bungalowForm.caretaker.telephoneNo}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, caretaker: { ...bungalowForm.caretaker, telephoneNo: e.target.value }})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Physical Address</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all"
                        placeholder="e.g. Circuit Bungalow Quarters, Diyatalawa"
                        value={bungalowForm.caretaker.address}
                        onChange={(e) => setBungalowForm({ ...bungalowForm, caretaker: { ...bungalowForm.caretaker, address: e.target.value }})}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3 */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[12px]">3</div>
                      Room Configurations
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddRoomRow}
                      className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Room
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bungalowForm.rooms.map((room, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-[20px] p-5 relative group">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[13px] font-extrabold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200">Room #{idx + 1}</span>
                          {bungalowForm.rooms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRoomRow(idx)}
                              className="text-red-500 hover:text-red-700 bg-white hover:bg-red-50 w-8 h-8 rounded-full border border-slate-200 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Room ID / Code</label>
                            <input
                              type="text"
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300"
                              placeholder="e.g. 101"
                              value={room.roomNumber}
                              onChange={(e) => handleRoomChange(idx, "roomNumber", e.target.value)}
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Type</label>
                            <select
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 appearance-none"
                              value={room.roomType}
                              onChange={(e) => handleRoomChange(idx, "roomType", e.target.value as "AC" | "NON_AC")}
                            >
                              <option value="NON_AC">Non-AC</option>
                              <option value="AC">AC Room</option>
                            </select>
                          </div>

                          <div className="col-span-12 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Beds</label>
                            <input
                              type="number"
                              min={1}
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300"
                              value={room.noOfBeds}
                              onChange={(e) => handleRoomChange(idx, "noOfBeds", parseInt(e.target.value) || 1)}
                            />
                          </div>

                          <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Price / Night (LKR)</label>
                            <input
                              type="number"
                              step="100"
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-[13px] font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300"
                              value={room.price}
                              onChange={(e) => handleRoomChange(idx, "price", parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="col-span-12">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">
                              Included Items (comma separated)
                            </label>
                            <input
                              type="text"
                              className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300"
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
              <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-20">
                <button
                  type="button"
                  onClick={() => setIsBungalowModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-[14px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveBungalow}
                  disabled={saving}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Data...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Bungalow
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
