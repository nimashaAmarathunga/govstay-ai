"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/context/UserContext";
import { useRouter } from "next/navigation";
import {
  Building2, Users, CalendarDays, Plus, Search,
  Edit2, Trash2, X, Save, AlertCircle, Loader2,
  Home, Phone, MapPin, BedDouble, FileText, CheckCircle2,
  Hotel, ArrowRight, ArrowLeft, LogOut, XCircle, Clock,
  AlertTriangle, Eye, Sparkles, Check, Filter, UserCheck,
  ShieldAlert, Mail, CreditCard, RefreshCw
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
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | string;
  totalCost: number | null;
  paymentSlipUrl?: string | null;
  approvalReason?: string | null;
  confidenceScore?: number | null;
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
    mobileNumber?: string | null;
    emailAddress?: string | null;
    nicNumber?: string | null;
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
  const router = useRouter();
  const { activeUser, setActiveUser } = useUser();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"bungalows" | "bookings">("bungalows");

  // Verify Admin Authentication on Mount
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) {
          setIsAdminAuthenticated(false);
          router.replace("/admin/login?callbackUrl=/admin");
        } else {
          setIsAdminAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAdminAuthenticated(false);
        router.replace("/admin/login?callbackUrl=/admin");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setActiveUser(null);
    router.push("/admin/login");
    router.refresh();
  };

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

  // Form State for Bungalow (Step 1: Details, Step 2: Rooms)
  const [isBungalowModalOpen, setIsBungalowModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [editingBungalowId, setEditingBungalowId] = useState<string | null>(null);
  const [bungalowForm, setBungalowForm] = useState<BungalowFormState>(DEFAULT_FORM_STATE);
  const [resolvingMapLink, setResolvingMapLink] = useState<boolean>(false);

  // Booking Manual Review & Status Update State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<DbBooking | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"CONFIRMED" | "REJECTED" | "PENDING">("CONFIRMED");
  const [reviewReason, setReviewReason] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"ALL" | "REJECTED" | "PENDING" | "CONFIRMED">("ALL");
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>("");
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);

  const handleOpenReviewModal = (booking: DbBooking) => {
    setSelectedBookingForReview(booking);
    setReviewStatus(
      booking.status === "REJECTED" ? "CONFIRMED" : (booking.status as any) || "CONFIRMED"
    );
    setReviewReason(booking.approvalReason || "");
    setStatusUpdateSuccess(null);
  };

  const handleUpdateBookingStatus = async () => {
    if (!selectedBookingForReview) return;
    try {
      setIsUpdatingStatus(true);
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBookingForReview.id,
          status: reviewStatus,
          approvalReason: reviewReason.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update booking status");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBookingForReview.id ? json.data : b))
      );
      setSelectedBookingForReview(json.data);
      setStatusUpdateSuccess(`Booking status updated to ${reviewStatus}`);
      setTimeout(() => {
        setSelectedBookingForReview(null);
        setStatusUpdateSuccess(null);
      }, 1000);
    } catch (err: any) {
      alert(err.message || "Failed to update booking status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleQuickStatusChange = async (bookingId: string, newStatus: "CONFIRMED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
          approvalReason: `Status manually updated to ${newStatus} by Administrator`,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? json.data : b))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

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
    if (isAdminAuthenticated === true) {
      fetchBungalows();
      fetchBookings();
    }
  }, [adminDepartment, isAdminAuthenticated]);

  // --- Handlers ---
  const handleAddBungalow = () => {
    setBungalowForm({
      ...DEFAULT_FORM_STATE,
      department: adminDepartment || DEFAULT_FORM_STATE.department,
    });
    setEditingBungalowId(null);
    setModalStep(1);
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
    setModalStep(1);
    setIsBungalowModalOpen(true);
  };

  const handleNextToRooms = () => {
    if (!bungalowForm.name.trim() || !bungalowForm.location.trim()) {
      alert("Please fill in required fields: Bungalow Name and Address.");
      return;
    }
    setModalStep(2);
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
      alert("Please fill in required fields: Bungalow Name and Address.");
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

  // --- Google Maps URL parser ---
  const parseLatLngFromGoogleMapsUrl = (url: string): { lat: string; lng: string } | null => {
    try {
      // Pattern 1: @lat,lng (most common — works for /maps/@, /maps/place/@)
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };

      // Pattern 2: q=lat,lng or q=lat%2Clng
      const qMatch = url.match(/[?&]q=(-?\d+\.\d+)[,|%2C](-?\d+\.\d+)/i);
      if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };

      // Pattern 3: ll=lat,lng
      const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) return { lat: llMatch[1], lng: llMatch[2] };

      // Pattern 4: !3dlat!4dlng (embedded maps)
      const embedMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (embedMatch) return { lat: embedMatch[1], lng: embedMatch[2] };

      return null;
    } catch {
      return null;
    }
  };

  const handleGmapLinkChange = async (url: string) => {
    setBungalowForm((prev) => ({
      ...prev,
      gmapLink: url,
    }));

    if (!url.trim()) return;

    // Instant client-side match for full Google Maps URLs
    const coords = parseLatLngFromGoogleMapsUrl(url);
    if (coords) {
      setBungalowForm((prev) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
      return;
    }

    // Call server-side redirect expander API for short links (e.g. maps.app.goo.gl)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        setResolvingMapLink(true);
        const res = await fetch(`/api/admin/expand-map-link?url=${encodeURIComponent(url.trim())}`);
        const json = await res.json();
        if (json.success && json.latitude && json.longitude) {
          setBungalowForm((prev) => ({
            ...prev,
            latitude: json.latitude,
            longitude: json.longitude,
          }));
        }
      } catch (err) {
        console.error("Error expanding map link:", err);
      } finally {
        setResolvingMapLink(false);
      }
    }
  };

  // Stats calculation
  const totalBungalows = bungalows.length;
  const totalRooms = bungalows.reduce((sum, b) => sum + (b.rooms?.length || b.noOfRooms || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED");
  const rejectedBookings = bookings.filter(b => b.status === "REJECTED");
  const pendingBookings = bookings.filter(b => b.status === "PENDING" || b.status === "PAYMENT_PENDING");

  const filteredBookings = bookings.filter(b => {
    if (bookingStatusFilter === "ALL") return true;
    return b.status === bookingStatusFilter;
  }).filter(b => {
    if (!bookingSearchQuery) return true;
    const lowerQuery = bookingSearchQuery.toLowerCase();
    return (
      (b.user?.nicNumber || "").toLowerCase().includes(lowerQuery) ||
      (b.user?.empId || "").toLowerCase().includes(lowerQuery) ||
      (b.bookingId || "").toLowerCase().includes(lowerQuery) ||
      (b.circuitBungalow?.name || "").toLowerCase().includes(lowerQuery)
    );
  });

  if (isAdminAuthenticated !== true) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3.5 border border-slate-800">
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
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  title="Sign out of Admin Portal"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats calculation & counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                <Hotel className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Bungalows</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{loading ? "..." : totalBungalows}</h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Configured Rooms</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{loading ? "..." : totalRooms}</h3>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Confirmed Stays</p>
                <h3 className="text-2xl font-extrabold text-emerald-700">{confirmedBookings.length}</h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => {
                setActiveTab("bookings");
                setBookingStatusFilter("REJECTED");
              }}
              className={`border rounded-3xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] ${rejectedBookings.length > 0
                ? "bg-rose-50/70 border-rose-200"
                : "bg-white border-slate-100"
                }`}
            >
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${rejectedBookings.length > 0 ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Needs Review</p>
                  {rejectedBookings.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
                <h3 className={`text-2xl font-extrabold ${rejectedBookings.length > 0 ? "text-rose-700" : "text-slate-900"}`}>
                  {rejectedBookings.length} Rejected
                </h3>
              </div>
            </motion.div>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl inline-flex mb-8 border border-slate-100 shadow-inner">
            <button
              onClick={() => setActiveTab("bungalows")}
              className={`px-6 py-2.5 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${activeTab === "bungalows" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Circuit Bungalows ({bungalows.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2.5 text-[14px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "bookings" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <span>Reservations & Approvals ({bookings.length})</span>
              {rejectedBookings.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {rejectedBookings.length} To Review
                </span>
              )}
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
                {/* Header with Search and Status Filter Pills */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Database Reservations & Approvals</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review automated decisions, override rejected applications, or update guest reservation status.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search ref ID, guest, bungalow..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 transition-all"
                    />
                    {bookingSearchQuery && (
                      <button
                        onClick={() => setBookingSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Filters: All, Rejected, Pending, Confirmed */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  <button
                    onClick={() => setBookingStatusFilter("ALL")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${bookingStatusFilter === "ALL"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    All ({bookings.length})
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter("REJECTED")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${bookingStatusFilter === "REJECTED"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                      }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Needs Review (Rejected) ({rejectedBookings.length})</span>
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter("PENDING")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${bookingStatusFilter === "PENDING"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending ({pendingBookings.length})</span>
                  </button>

                  <button
                    onClick={() => setBookingStatusFilter("CONFIRMED")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${bookingStatusFilter === "CONFIRMED"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmed ({confirmedBookings.length})</span>
                  </button>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-24 text-center text-slate-500 flex flex-col items-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-2">No Bookings Found</p>
                    <p className="text-[15px] font-medium text-slate-500">
                      {bookingStatusFilter !== "ALL"
                        ? `No reservations matching the filter "${bookingStatusFilter}".`
                        : "The database currently has no booking records."}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="col-span-3">Booking Ref & Guest</div>
                      <div className="col-span-3">Accommodation</div>
                      <div className="col-span-2">Stay Dates</div>
                      <div className="col-span-2">Status & AI Reason</div>
                      <div className="col-span-2 text-right">Manual Action</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredBookings.map((b) => {
                        const isRejected = b.status === "REJECTED";
                        const isConfirmed = b.status === "CONFIRMED";
                        const isPending = b.status === "PENDING";

                        return (
                          <div
                            key={b.id}
                            className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 md:px-8 py-5 items-center transition-colors ${isRejected
                              ? "bg-rose-50/30 hover:bg-rose-50/60 border-l-4 border-l-rose-500"
                              : "hover:bg-slate-50/50"
                              }`}
                          >
                            {/* Column 1: Reference & Guest */}
                            <div className="col-span-1 lg:col-span-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-mono font-bold">
                                  {b.bookingId}
                                </span>
                                {isRejected && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                                    Action Required
                                  </span>
                                )}
                              </div>
                              <p className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {b.user?.name || "Guest User"}
                              </p>
                              <div className="text-[11px] text-slate-500 font-medium space-y-0.5 mt-1 ml-5">
                                {b.user?.empId && <p>Emp ID: <span className="font-semibold text-slate-700">{b.user.empId}</span></p>}
                                {b.user?.placeOfWork && <p className="truncate max-w-[200px]">{b.user.placeOfWork}</p>}
                              </div>
                            </div>

                            {/* Column 2: Accommodation */}
                            <div className="col-span-1 lg:col-span-3">
                              <p className="text-[13.5px] font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                                <Hotel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{b.circuitBungalow?.name || "Circuit Bungalow"}</span>
                              </p>
                              <p className="text-[12px] font-medium text-slate-500 ml-5">
                                Room: {b.room ? `${b.room.roomNumber} (${b.room.roomType})` : "General Stay"}
                              </p>
                              {b.totalCost && (
                                <p className="text-[12px] font-bold text-slate-700 ml-5 mt-1">
                                  LKR {b.totalCost.toLocaleString()}
                                </p>
                              )}
                            </div>

                            {/* Column 3: Dates */}
                            <div className="col-span-1 lg:col-span-2">
                              <div className="text-[12px] font-medium text-slate-600 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  <span>In: {new Date(b.fromDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                  <span>Out: {new Date(b.toDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Column 4: Status & AI Reasoning */}
                            <div className="col-span-1 lg:col-span-2">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isConfirmed
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isPending
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                    }`}
                                >
                                  {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                                  {isPending && <Clock className="w-3 h-3" />}
                                  {isRejected && <AlertTriangle className="w-3 h-3" />}
                                  {b.status}
                                </span>
                              </div>

                              {b.approvalReason ? (
                                <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-white/80 p-1.5 rounded-lg border border-slate-100">
                                  "{b.approvalReason}"
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No automated reasoning recorded.</p>
                              )}
                            </div>

                            {/* Column 5: Manual Action Buttons */}
                            <div className="col-span-1 lg:col-span-2 flex flex-wrap lg:flex-col items-start lg:items-end justify-start lg:justify-center gap-2 mt-2 lg:mt-0">
                              <button
                                onClick={() => handleOpenReviewModal(b)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${isRejected
                                  ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300"
                                  : "bg-slate-900 hover:bg-slate-800 text-white"
                                  }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isRejected ? "Review & Override" : "Review Details"}</span>
                              </button>

                              {isRejected && (
                                <button
                                  onClick={() => handleQuickStatusChange(b.id, "CONFIRMED")}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Instantly Confirm this booking"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Quick Approve</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                {modalStep === 1 && (
                  <>
                    {/* SECTION 1: Bungalow Details */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Bungalow Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Bungalow Name</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Bungalow Name"
                            value={bungalowForm.name}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Address</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="e.g. No. 12 Hill Street, Nuwara Eliya"
                            value={bungalowForm.location}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Department</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Department"
                            value={bungalowForm.department}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, department: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Capacity</label>
                          <input
                            type="number"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Capacity"
                            value={bungalowForm.capacity}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">No. of Rooms</label>
                          <input
                            type="number"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="No. of Rooms"
                            value={bungalowForm.noOfRooms}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, noOfRooms: Number(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Image URL</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Image URL"
                            value={bungalowForm.image}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, image: e.target.value }))}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Description</label>
                          <textarea
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Description"
                            rows={3}
                            value={bungalowForm.description}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 1b: Location & Map */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Location &amp; Map</h3>
                      <p className="text-[12px] text-slate-400 mb-4">Paste a Google Maps link to auto-extract coordinates.</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Google Maps Link</label>
                          <input
                            type="url"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="https://www.google.com/maps/@6.9271,79.8612,15z"
                            value={bungalowForm.gmapLink || ""}
                            onChange={(e) => handleGmapLinkChange(e.target.value)}
                          />
                        </div>

                        {/* Read-only coordinates display */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-2">Detected Coordinates</label>
                          {resolvingMapLink ? (
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-[12px] font-medium">Resolving Google Maps short link &amp; extracting coordinates...</span>
                            </div>
                          ) : bungalowForm.latitude && bungalowForm.longitude ? (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                <span className="text-emerald-600 text-sm">📍</span>
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Lat</span>
                                <span className="text-[13px] font-semibold text-emerald-900 font-mono">{bungalowForm.latitude}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                <span className="text-emerald-600 text-sm">📍</span>
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Lng</span>
                                <span className="text-[13px] font-semibold text-emerald-900 font-mono">{bungalowForm.longitude}</span>
                              </div>
                              <span className="text-[11px] text-slate-400">Auto-extracted from map link</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3 text-slate-400">
                              <span className="text-sm">🗺️</span>
                              <span className="text-[12px]">Paste a valid Google Maps link above to detect coordinates automatically.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Caretaker Details */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Caretaker Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Name</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Caretaker Name"
                            value={bungalowForm.caretaker.name}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, caretaker: { ...prev.caretaker, name: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Address</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Caretaker Address"
                            value={bungalowForm.caretaker.address}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, caretaker: { ...prev.caretaker, address: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Telephone No</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Telephone Number"
                            value={bungalowForm.caretaker.telephoneNo}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, caretaker: { ...prev.caretaker, telephoneNo: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Email Address"
                            value={bungalowForm.caretaker.emailAddress}
                            onChange={(e) => setBungalowForm(prev => ({ ...prev, caretaker: { ...prev.caretaker, emailAddress: e.target.value } }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer for Step 1 */}
                    <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-20">
                      <button
                        type="button"
                        onClick={() => setIsBungalowModalOpen(false)}
                        className="px-6 py-3 rounded-xl text-[14px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleNextToRooms}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[14px] font-bold shadow-lg hover:bg-slate-800 transition-all"
                      >
                        Configure Rooms
                      </button>
                    </div>
                  </>
                )}

                {modalStep === 2 && (
                  <>
                    {/* SECTION 3: Configure Rooms */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Configure Rooms</h3>
                      {bungalowForm.rooms.map((room, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 bg-slate-50/20 p-4 rounded-xl mb-4">
                          <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Room Number</label>
                            <input
                              type="text"
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900"
                              value={room.roomNumber}
                              onChange={(e) => handleRoomChange(idx, "roomNumber", e.target.value)}
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Room Type</label>
                            <select
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900"
                              value={room.roomType}
                              onChange={(e) => handleRoomChange(idx, "roomType", e.target.value as any)}
                            >
                              <option value="AC">AC</option>
                              <option value="NON_AC">NON AC</option>
                            </select>
                          </div>
                          <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">No. of Beds</label>
                            <input
                              type="number"
                              min={1}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900"
                              value={room.noOfBeds}
                              onChange={(e) => handleRoomChange(idx, "noOfBeds", parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Price / Night (LKR)</label>
                            <input
                              type="number"
                              step="100"
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900"
                              value={room.price}
                              onChange={(e) => handleRoomChange(idx, "price", parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-12">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Included Items (comma separated)</label>
                            <input
                              type="text"
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900"
                              placeholder="Double Bed, Geyser, Wardrobe, Ensuite Bathroom"
                              value={room.items}
                              onChange={(e) => handleRoomChange(idx, "items", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddRoomRow}
                          disabled={bungalowForm.rooms.length >= bungalowForm.noOfRooms}
                          title={bungalowForm.rooms.length >= bungalowForm.noOfRooms ? `Your Bungalow only has ${bungalowForm.noOfRooms} rooms.` : undefined}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                          Add Room
                        </button>
                        {bungalowForm.rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRoomRow(bungalowForm.rooms.length - 1)}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            Remove Last Room
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer for Step 2 */}
                    <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-20">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="px-6 py-3 rounded-xl text-[14px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={saveBungalow}
                        disabled={saving}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[14px] font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
        
        {/* --- MANUAL BOOKING REVIEW & STATUS OVERRIDE MODAL --- */}
        {selectedBookingForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBookingForReview(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      Review Reservation
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200/80 text-slate-700">
                        {selectedBookingForReview.bookingId}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Manually verify guest credentials and update reservation status
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBookingForReview(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                {/* Status Notice Banner */}
                {selectedBookingForReview.status === "REJECTED" && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900 mb-0.5">Currently Rejected Application</p>
                      <p className="leading-relaxed text-rose-700">
                        This reservation was marked as REJECTED. You can review the details below, override the decision, and update the status to CONFIRMED.
                      </p>
                    </div>
                  </div>
                )}

                {statusUpdateSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{statusUpdateSuccess}</span>
                  </div>
                )}

                {/* Section 1: Guest Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Guest Profile & Employment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Full Name</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {selectedBookingForReview.user?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Employee ID</span>
                      <span className="font-bold text-slate-800 text-sm font-mono">
                        {selectedBookingForReview.user?.empId || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Place of Work / Dept</span>
                      <span className="font-medium text-slate-700">
                        {selectedBookingForReview.user?.placeOfWork || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">NIC Number</span>
                      <span className="font-mono text-slate-700 font-medium">
                        {selectedBookingForReview.user?.nicNumber || "N/A"}
                      </span>
                    </div>
                    {selectedBookingForReview.user?.mobileNumber && (
                      <div>
                        <span className="text-slate-400 block font-medium mb-0.5">Phone Number</span>
                        <span className="text-slate-700 font-medium">
                          {selectedBookingForReview.user.mobileNumber}
                        </span>
                      </div>
                    )}
                    {selectedBookingForReview.user?.emailAddress && (
                      <div>
                        <span className="text-slate-400 block font-medium mb-0.5">Email</span>
                        <span className="text-slate-700 font-medium">
                          {selectedBookingForReview.user.emailAddress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Accommodation & Booking Dates */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5 text-indigo-600" />
                    Stay Details & Accommodation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Circuit Bungalow</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedBookingForReview.circuitBungalow?.name || "N/A"}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {selectedBookingForReview.circuitBungalow?.location}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Room</span>
                      <span className="font-bold text-slate-900">
                        {selectedBookingForReview.room
                          ? `Room ${selectedBookingForReview.room.roomNumber} (${selectedBookingForReview.room.roomType})`
                          : "General Booking"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Check-In & Check-Out</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(selectedBookingForReview.fromDate).toLocaleDateString()} — {new Date(selectedBookingForReview.toDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Total Cost</span>
                      <span className="font-extrabold text-slate-900 text-sm text-emerald-700">
                        {selectedBookingForReview.totalCost
                          ? `LKR ${selectedBookingForReview.totalCost.toLocaleString()}`
                          : "Free / Standard Rate"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Automated Decision & Reasoning */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Recorded Reasoning / System Audit
                  </h4>
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs text-slate-700">
                    <p className="italic font-medium leading-relaxed">
                      {selectedBookingForReview.approvalReason
                        ? `"${selectedBookingForReview.approvalReason}"`
                        : "No automated reasoning recorded."}
                    </p>
                    {selectedBookingForReview.confidenceScore != null && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Confidence: {(selectedBookingForReview.confidenceScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 4: Status Decision Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Select New Status
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setReviewStatus("CONFIRMED")}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${reviewStatus === "CONFIRMED"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300"
                        }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm (Approve)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewStatus("REJECTED")}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${reviewStatus === "REJECTED"
                        ? "bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50/50 hover:border-rose-300"
                        }`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject Application</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewStatus("PENDING")}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${reviewStatus === "PENDING"
                        ? "bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50 hover:border-amber-300"
                        }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span>Mark Pending</span>
                    </button>
                  </div>
                </div>

                {/* Section 5: Admin Review Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Admin Review Note / Approval Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide justification or notes for this status change (e.g. 'Manually approved after verifying official duties with department head')..."
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 sm:px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReview(null)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateBookingStatus}
                  disabled={isUpdatingStatus}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Status...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Decision ({reviewStatus})</span>
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

