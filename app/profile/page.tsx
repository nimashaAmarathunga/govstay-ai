"use client";

import React, { useState, useEffect, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Hash,
  Building2,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  UploadCloud,
  FileText,
  ArrowLeft,
  Camera,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { useUser, roleLabel, roleBadgeClass, userInitial } from "@/components/context/UserContext";

interface ProfileData {
  name: string;
  username: string;
  emailAddress: string;
  mobileNumber: string;
  empId: string;
  placeOfWork: string;
  position: string;
  nicNumber: string;
  preferredDistrict: string;
  residentialAddress: string;
  empIdPhoto: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { activeUser, checkAuthSession } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    username: "",
    emailAddress: "",
    mobileNumber: "",
    empId: "",
    placeOfWork: "",
    position: "",
    nicNumber: "",
    preferredDistrict: "",
    residentialAddress: "",
    empIdPhoto: "",
  });

  // ID upload state
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data
  useEffect(() => {
    if (activeUser) {
      setProfileData({
        name: activeUser.name || "",
        username: activeUser.username || "",
        emailAddress: activeUser.emailAddress || "",
        mobileNumber: activeUser.mobileNumber || "",
        empId: activeUser.empId || "",
        placeOfWork: activeUser.placeOfWork || "",
        position: activeUser.position || "",
        nicNumber: activeUser.nicNumber || "",
        preferredDistrict: activeUser.preferredDistrict || "",
        residentialAddress: activeUser.residentialAddress || "",
        empIdPhoto: activeUser.empIdPhoto || "",
      });
      setLoading(false);
    }
  }, [activeUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!activeUser) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/users/profile?userId=${activeUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          emailAddress: profileData.emailAddress,
          mobileNumber: profileData.mobileNumber,
          empId: profileData.empId,
          placeOfWork: profileData.placeOfWork,
          position: profileData.position,
          nicNumber: profileData.nicNumber,
          preferredDistrict: profileData.preferredDistrict,
          residentialAddress: profileData.residentialAddress,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      await checkAuthSession();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // ID Upload handlers
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image (JPG, PNG, WEBP) or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleIdUpload = async () => {
    if (!selectedFile || !activeUser) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "ids");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload ID document.");
      }

      const updateRes = await fetch(`/api/users/profile?userId=${activeUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empIdPhoto: uploadData.url }),
      });

      if (!updateRes.ok) throw new Error("Failed to save ID to profile.");

      setProfileData(prev => ({ ...prev, empIdPhoto: uploadData.url }));
      setSuccess("ID document uploaded successfully!");
      setShowUpload(false);
      setSelectedFile(null);
      setFilePreview(null);
      await checkAuthSession();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !activeUser) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50/60 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </main>
    );
  }

  const memberSince = activeUser.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  const profileFields = [
    { label: "Full Name", key: "name", icon: User, editable: true, type: "text" },
    { label: "Username", key: "username", icon: User, editable: false, type: "text" },
    { label: "Email Address", key: "emailAddress", icon: Mail, editable: true, type: "email" },
    { label: "Mobile Number", key: "mobileNumber", icon: Phone, editable: true, type: "tel" },
    { label: "Employee ID", key: "empId", icon: Hash, editable: true, type: "text" },
    { label: "NIC Number", key: "nicNumber", icon: CreditCard, editable: true, type: "text" },
    { label: "Department / Ministry", key: "placeOfWork", icon: Building2, editable: true, type: "text" },
    { label: "Designation", key: "position", icon: Briefcase, editable: true, type: "text" },
    { label: "Preferred District", key: "preferredDistrict", icon: Globe, editable: true, type: "text" },
    { label: "Residential Address", key: "residentialAddress", icon: MapPin, editable: true, type: "text" },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white py-10 px-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="mx-auto max-w-4xl relative">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Browse
          </Link>

          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl border-2 border-white/20">
                <span className="text-3xl font-bold text-white select-none">{userInitial(activeUser.name)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">{activeUser.name}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-sm text-slate-300">@{activeUser.username}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activeUser.role === "GOV_EMPLOYEE" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                  activeUser.role === "PUBLIC_USER" ? "bg-slate-500/20 text-slate-300 border border-slate-500/30" :
                  "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {roleLabel(activeUser.role)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member since {memberSince}
              </p>
            </div>

            {/* Edit Toggle */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => { setIsEditing(false); setError(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all border border-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 -mt-6">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto shrink-0 cursor-pointer"><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Edit Buttons */}
        <div className="sm:hidden mb-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setIsEditing(false); setError(null); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium cursor-pointer">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold cursor-pointer disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Details Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Profile Information
            </h3>
            {isEditing && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Editing
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-50">
            {profileFields.map((field) => {
              const Icon = field.icon;
              const value = profileData[field.key as keyof ProfileData] || "";

              return (
                <div key={field.key} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{field.label}</p>
                    {isEditing && field.editable ? (
                      <input
                        type={field.type}
                        name={field.key}
                        value={value}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <p className={`text-sm font-medium truncate ${value ? "text-slate-900" : "text-slate-300 italic"}`}>
                        {value || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ID Document Section */}
        <div className="mt-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              ID Verification Document
            </h3>
            {profileData.empIdPhoto ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Uploaded
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                Not Uploaded
              </span>
            )}
          </div>

          <div className="p-6">
            {profileData.empIdPhoto && !showUpload ? (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">ID Document Uploaded</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your identity document has been verified and stored securely.</p>
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Re-upload
                </button>
              </div>
            ) : (
              <>
                {/* Upload Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                      : selectedFile
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />

                  {selectedFile ? (
                    <div className="relative">
                      {filePreview ? (
                        <div className="rounded-xl overflow-hidden max-h-40 border border-slate-200 bg-white">
                          <img src={filePreview} alt="Preview" className="w-full object-contain max-h-40" />
                        </div>
                      ) : (
                        <div className="py-4 flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 text-emerald-600" />
                          <span className="text-xs font-semibold truncate max-w-[180px]">{selectedFile.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFilePreview(null); }}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col items-center gap-2 text-slate-500">
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-700">Click or drag your ID document</p>
                      <p className="text-xs text-slate-400">JPG, PNG, WEBP or PDF (max 10MB)</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {showUpload && (
                    <button
                      onClick={() => { setShowUpload(false); setSelectedFile(null); setFilePreview(null); }}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleIdUpload}
                    disabled={isUploading || !selectedFile}
                    className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                  >
                    {isUploading ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                    ) : (
                      <><UploadCloud className="w-3.5 h-3.5" /> Upload Document</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Info Footer */}
        <div className="mt-6 mb-12 rounded-2xl bg-slate-100/80 border border-slate-200/80 p-5">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Your account data is encrypted and securely stored. For account deletion or role changes, please contact the system administrator.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
