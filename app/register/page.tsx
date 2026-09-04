"use client";

import React, { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Hash,
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  ShieldCheck,
  Sparkles,
  SkipForward,
} from "lucide-react";
import { useUser, AppUser } from "@/components/context/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setActiveUser, checkAuthSession } = useUser();

  // ─── Step Management ────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [createdUser, setCreatedUser] = useState<AppUser | null>(null);

  // ─── Step 1: Registration Form ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    emailAddress: "",
    mobileNumber: "",
    username: "",
    password: "",
    placeOfWork: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Step 2: ID Upload ──────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Step 1 Handlers ───────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      // Store the created user and move to Step 2
      const user = data.user as AppUser;
      setCreatedUser(user);
      setActiveUser(user);
      await checkAuthSession();
      setLoading(false);
      setStep(2);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // ─── Step 2 Handlers ──────────────────────────────────────────────────────
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid image (JPG, PNG, WEBP) or a PDF document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds maximum limit of 10MB.");
      return;
    }

    setUploadError(null);
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

  const handleUploadSubmit = async () => {
    if (!selectedFile || !createdUser) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      // 1. Upload file to Supabase via API
      const uploadBody = new FormData();
      uploadBody.append("file", selectedFile);
      uploadBody.append("folder", "ids");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload ID document.");
      }

      // 2. Save the uploaded URL to the user's profile
      const updateRes = await fetch(`/api/users/profile?userId=${createdUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empIdPhoto: uploadData.url }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to save ID document to profile.");
      }

      setUploadSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/browse");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkipUpload = () => {
    router.push("/browse");
    router.refresh();
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex flex-col justify-center items-center p-4 py-12 relative overflow-y-auto">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative h-12 w-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="GovSewana Logo" fill className="object-contain mix-blend-multiply" priority />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">GovSewana</h1>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Create Account</p>
          </div>
        </Link>
      </motion.div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex items-center gap-3 relative z-10"
      >
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          step === 1
            ? "bg-blue-600 text-white shadow-md"
            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
        }`}>
          {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">1</span>}
          <span>Account Details</span>
        </div>

        <div className="w-8 h-px bg-slate-300" />

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          step === 2
            ? "bg-blue-600 text-white shadow-md"
            : "bg-slate-100 text-slate-400 border border-slate-200"
        }`}>
          <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">2</span>
          <span>Upload ID</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.96, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
          >
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <span>Register New Account</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">Join the official government accommodation platform</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                Step 1 of 2
              </span>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. Kasun Perera" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. kasun_p" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
                    <input type="email" name="emailAddress" required value={formData.emailAddress} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="user@gov.lk" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Phone className="w-4 h-4" /></div>
                    <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="07XXXXXXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Employee ID (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Hash className="w-4 h-4" /></div>
                    <input type="text" name="empId" value={formData.empId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. 245503B" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Department / Ministry</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Building2 className="w-4 h-4" /></div>
                    <input type="text" name="placeOfWork" required value={formData.placeOfWork} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="Ministry of Public Administration" />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="••••••••••••" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 pl-1">Min 8 characters with at least one letter and one number or special character</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Account...</span></>
                ) : (
                  <><span>Continue to ID Upload</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">Sign In</Link>
              </p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: 20 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
          >
            {/* Success State */}
            {uploadSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mx-auto h-20 w-20 mb-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Registration Complete!</h2>
                <p className="text-slate-500 mt-2 text-sm">Your account has been created and ID uploaded successfully.</p>
                <p className="text-slate-400 text-xs mt-3">Redirecting to browse bungalows...</p>
                <div className="mt-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      <span>Upload ID Document</span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload your Government ID or NIC to verify your eligibility
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    Step 2 of 2
                  </span>
                </div>

                {/* Welcome Message */}
                {createdUser && (
                  <div className="mb-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">{createdUser.name?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Welcome, {createdUser.name}!</p>
                      <p className="text-xs text-slate-500">Your account has been created. Now upload your ID for verification.</p>
                    </div>
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0 ml-auto" />
                  </div>
                )}

                {uploadError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{uploadError}</span>
                  </motion.div>
                )}

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
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
                    <div className="relative group">
                      {filePreview ? (
                        <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200 bg-white">
                          <img src={filePreview} alt="Preview" className="w-full object-contain max-h-48" />
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
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center gap-3 text-slate-500">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                        <UploadCloud className="w-7 h-7 text-slate-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Click or drag your ID document</p>
                        <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP or PDF (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your document is securely stored and used only for verifying booking eligibility.</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSkipUpload}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip for Now
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || !selectedFile}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99] shadow-md"
                  >
                    {isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading...</span></>
                    ) : (
                      <><UploadCloud className="w-4 h-4" /><span>Upload & Complete</span></>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
