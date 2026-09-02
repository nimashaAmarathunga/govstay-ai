"use client";

import React, { useState, useRef } from "react";

interface PaymentSlipUploadProps {
  onUploadComplete: (url: string | null) => void;
  value?: string | null;
  bookingId: string;
  userId?: string;
}

export default function PaymentSlipUpload({ onUploadComplete, value, bookingId, userId }: PaymentSlipUploadProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(value || null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    if (!validTypes.includes(file.type) && !isPdf && !isImage) {
      setError("Please upload an image (JPG, PNG, WEBP) or a PDF document.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    setFileType(isPdf ? "pdf" : "image");
    setFileSize(formatBytes(file.size));

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookingId", bookingId);
      if (userId) {
        formData.append("userId", userId);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload payment slip.");
      }

      setFileUrl(data.paymentSlipId);
      onUploadComplete(data.paymentSlipId);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file. Please try again.");
      setFileUrl(null);
      onUploadComplete(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setFileUrl(null);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setFileName(null);
    setFileType(null);
    setFileSize(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadComplete(null);
  };

  const isPdfFile = fileType === "pdf" || fileUrl?.endsWith(".pdf") || fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Payment Slip <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>
        <span className="text-[11px] text-blue-600 font-medium">JPG, PNG, WEBP or PDF</span>
      </div>

      {!fileUrl && !isUploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50/80 scale-[0.99]"
              : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">cloud_upload</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Upload picture or PDF slip (Max 10MB)</p>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4 flex items-center space-x-3">
          <span className="material-symbols-outlined text-blue-600 animate-spin text-2xl">sync</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-900 truncate">Uploading {fileName}...</p>
            <p className="text-[11px] text-blue-700">{fileSize || "Processing..."}</p>
          </div>
        </div>
      )}

      {fileUrl && !isUploading && (
        <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {isPdfFile ? (
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-emerald-200 bg-white">
                <img
                  src={localPreviewUrl || ""}
                  alt="Payment slip preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {fileName || "Payment Slip Attached"}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {isPdfFile ? "PDF Document" : "Image File"} {fileSize ? `• ${fileSize}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Remove File"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-xs">
          <span className="material-symbols-outlined text-red-500 text-base">error</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
