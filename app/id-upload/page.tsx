"use client";

import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import { useUser, AppUser } from "@/components/context/UserContext";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Building,
  CreditCard,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5";

export default function IdUploadPage() {
  const { setActiveUser, refreshUsers } = useUser();
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    nicNumber: "",
    empId: "",
    mobileNumber: "",
    emailAddress: "",
    placeOfWork: "",
    position: "",
    status: "WORKING" as "WORKING" | "RETIRED",
    role: "GOV_EMPLOYEE" as "GOV_EMPLOYEE" | "PUBLIC_USER" | "DEPT_ADMIN",
    preferredDistrict: "",
    residentialAddress: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Status & feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRecord, setCreatedRecord] = useState<AppUser | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Form Inputs
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setErrorMessage(null);
  };

  // Handle File Selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Please select a valid image (JPG, PNG, WEBP) or a PDF document.");
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds maximum limit of 10MB.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage("Please upload your ID Card (photo or PDF) before submitting.");
      return;
    }

    if (!formData.password) {
      setErrorMessage("Please enter a password for your user account.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password and Confirm Password do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Upload ID Card file to server
      const uploadBody = new FormData();
      uploadBody.append("file", selectedFile);
      uploadBody.append("folder", "ids");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload ID card document.");
      }

      const idCardUrl = uploadData.url;

      // 2. Insert User Record in Postgres `users` table
      const userRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          empIdPhoto: idCardUrl
        })
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error(userData.error || "Failed to insert user record in database.");
      }

      // 3. Success! Update User Context and state
      setCreatedRecord(userData);
      await refreshUsers();
      setActiveUser(userData);

    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during data insertion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedRecord(null);
    setSelectedFile(null);
    setFilePreview(null);
    setShowPassword(false);
    setFormData({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      nicNumber: "",
      empId: "",
      mobileNumber: "",
      emailAddress: "",
      placeOfWork: "",
      position: "",
      status: "WORKING",
      role: "GOV_EMPLOYEE",
      preferredDistrict: "",
      residentialAddress: ""
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white py-12 px-6 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Database Integration Active
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Upload ID & User Info</h1>
          <p className="mt-2 text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
            Upload your official identity card document and details. A verified record will be created in the system database for authentication and stay eligibility.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 -mt-6">
        <AnimatePresence mode="wait">
          {createdRecord ? (
            /* Success Card View */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-3xl bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/50">
                    Data Insertion Successful
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">User Record Created in Database</h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Database Record Details</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Record ID</span>
                      <span className="font-mono text-slate-800 text-xs font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">{createdRecord.id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Full Name</span>
                      <span className="font-semibold text-slate-900">{createdRecord.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Username</span>
                      <span className="font-mono text-slate-800">@{createdRecord.username}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Employee / Member ID</span>
                      <span className="font-semibold text-slate-900">{createdRecord.empId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">NIC Number</span>
                      <span className="font-semibold text-slate-900">{createdRecord.nicNumber || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Ministry / Dept</span>
                      <span className="font-semibold text-slate-900">{createdRecord.placeOfWork || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Uploaded ID Card Document</h3>
                    {createdRecord.empIdPhoto ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white max-h-56 flex items-center justify-center p-2 shadow-sm">
                        {createdRecord.empIdPhoto.endsWith(".pdf") ? (
                          <div className="py-8 flex flex-col items-center gap-2 text-slate-600">
                            <FileText className="w-12 h-12 text-slate-400" />
                            <span className="text-xs font-semibold">{createdRecord.empIdPhoto.split("/").pop()}</span>
                          </div>
                        ) : (
                          <img
                            src={createdRecord.empIdPhoto}
                            alt="Uploaded ID Card"
                            className="max-h-48 object-contain rounded-lg"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm italic">No ID photo stored.</p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/50">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    User activated in workspace session automatically.
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={() => router.push("/bookings")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer text-sm"
                >
                  <span>Go to My Bookings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => router.push("/browse")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                >
                  <span>Browse Bungalows</span>
                </button>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-sm ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Insert Another Record</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Upload & Info Form */
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="grid gap-8 lg:grid-cols-[22rem_1fr]"
            >
              {/* Left Column: ID Card Upload Zone */}
              <div className="flex flex-col gap-6">
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">ID Card Document</h2>
                      <p className="text-xs text-slate-500">Government ID or NIC scan</p>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                        ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
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
                      <div className="relative group">
                        {filePreview ? (
                          <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200 bg-white">
                            <img src={filePreview} alt="ID Card Preview" className="w-full object-contain max-h-48" />
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center gap-2 text-slate-700">
                            <FileText className="w-10 h-10 text-emerald-600" />
                            <span className="text-xs font-semibold truncate max-w-[180px]">{selectedFile.name}</span>
                            <span className="text-[11px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center gap-3 text-slate-500">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-700">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Click or drag ID card image / PDF
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Supports JPG, PNG, WEBP or PDF (max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-600 space-y-2">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>The uploaded ID is securely linked to your record in the <code className="font-mono text-slate-800">users</code> database table.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: User Information Form */}
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-8">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Personal Information Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <UserCheck className="w-5 h-5 text-slate-700" />
                    <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Full Name *</span>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Priyantha Silva"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">NIC Number *</span>
                      <input
                        required
                        type="text"
                        name="nicNumber"
                        value={formData.nicNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 198512345678 or 851234567V"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Username (Optional)</span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Auto-generated if left blank"
                        className={inputClassName}
                      />
                    </label>

                    <label className="relative">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Account Password *</span>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create secure password"
                          className={`${inputClassName} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Confirm Password *</span>
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Re-enter password"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Mobile Number</span>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 077 123 4567"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Email Address</span>
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className={inputClassName}
                      />
                    </label>

                    <label className="md:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Residential Address</span>
                      <input
                        type="text"
                        name="residentialAddress"
                        value={formData.residentialAddress}
                        onChange={handleInputChange}
                        placeholder="Street, City, District"
                        className={inputClassName}
                      />
                    </label>
                  </div>
                </section>

                {/* Employment & Classification Section */}
                <section className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <Building className="w-5 h-5 text-slate-700" />
                    <h2 className="text-lg font-bold text-slate-900">Employment & Eligibility</h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Government Member / Emp ID</span>
                      <input
                        type="text"
                        name="empId"
                        value={formData.empId}
                        onChange={handleInputChange}
                        placeholder="e.g. GOV-245801"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Ministry / Department</span>
                      <input
                        type="text"
                        name="placeOfWork"
                        value={formData.placeOfWork}
                        onChange={handleInputChange}
                        placeholder="e.g. Ministry of Public Administration"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Position / Designation</span>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Administrative Officer"
                        className={inputClassName}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Work Status</span>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={inputClassName}
                      >
                        <option value="WORKING">Working Employee</option>
                        <option value="RETIRED">Retired Employee</option>
                      </select>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Role Classification</span>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={inputClassName}
                      >
                        <option value="GOV_EMPLOYEE">Government Employee</option>
                        <option value="PUBLIC_USER">Public User</option>
                        <option value="DEPT_ADMIN">Department Admin</option>
                      </select>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">Preferred District</span>
                      <select
                        name="preferredDistrict"
                        value={formData.preferredDistrict}
                        onChange={handleInputChange}
                        className={inputClassName}
                      >
                        <option value="">Select District</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Galle">Galle</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Nuwara Eliya">Nuwara Eliya</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Polonnaruwa">Polonnaruwa</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Trincomalee">Trincomalee</option>
                        <option value="Ratnapura">Ratnapura</option>
                      </select>
                    </label>
                  </div>
                </section>

                {/* Submit Action Bar */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-between pl-6 pr-1.5 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white font-medium shadow-[0_10px_25px_-5px_rgba(15,23,42,0.4)] border border-slate-700/80 hover:border-slate-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-[15px] font-medium tracking-wide text-slate-100 pr-4 select-none">
                      {isSubmitting ? "Saving to Database..." : "Upload ID & Save User Record"}
                    </span>

                    <div className="h-10 w-10 rounded-full bg-gradient-to-b from-white to-slate-100 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-slate-200/80 shrink-0 transition-transform group-hover:translate-x-0.5">
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 text-slate-900 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 text-slate-900 fill-slate-900 rotate-45" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
