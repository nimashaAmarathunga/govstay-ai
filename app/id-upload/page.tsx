"use client";

import { useState, useRef, FormEvent, DragEvent } from "react";
import { useUser } from "@/components/context/UserContext";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IdUploadPage() {
  const { activeUser, refreshUsers } = useUser();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Please select a valid image (JPG, PNG, WEBP) or a PDF document.");
      return;
    }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeUser) {
      setErrorMessage("You must be logged in to upload an ID.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadBody = new FormData();
      uploadBody.append("file", selectedFile);
      uploadBody.append("folder", "ids");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload ID document.");
      }

      const idCardUrl = uploadData.url;

      // Call API to update user profile with empIdPhoto
      const updateRes = await fetch(`/api/users/profile?userId=${activeUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empIdPhoto: idCardUrl }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to save ID document to profile.");
      }

      await refreshUsers();
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/browse");
      }, 2000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-16">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white py-12 px-6 shadow-sm">
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Identity Verification
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Upload ID Document</h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">
            Please provide your official Government ID or NIC to verify your eligibility for GovSewana bookings.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 -mt-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="rounded-md bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-slate-100 text-center"
            >
              <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">ID Uploaded Successfully</h2>
              <p className="text-slate-500 mt-2">Redirecting you to browse bungalows...</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="rounded-md bg-white p-6 md:p-8 shadow-sm border border-slate-200/80"
            >
              {errorMessage && (
                <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-md border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-blue-500 bg-brand-primary/5/50 scale-[1.01]"
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
                      <div className="relative rounded-md overflow-hidden max-h-48 border border-slate-200 bg-white">
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
                    <div className="h-12 w-12 rounded-md bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Click or drag ID document</p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP or PDF (max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-md bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Your document is securely stored and used only for verifying booking eligibility.</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary text-white font-medium hover:bg-[#12242b] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Navigation className="w-4 h-4 rotate-45" /> Submit Document</>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
