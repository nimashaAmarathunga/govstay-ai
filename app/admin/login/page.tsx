"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
} from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated on load
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) {
          router.replace(callbackUrl);
        }
      })
      .catch(() => { });
  }, [router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username/employee ID and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (userStr: string, passStr: string) => {
    setUsername(userStr);
    setPassword(passStr);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#157954] selection:text-white">
      {/* Ambient Background Gradient */}
      <div className="absolute top-0 w-full h-[40vh] bg-gradient-palette-1 opacity-20 pointer-events-none" />

      {/* Header Logo (GovSewana Logo) */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative h-12 w-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo_new.png"
              alt="GovSewana Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#21263A]">
              GovSewana
            </h1>
            <p className="text-[11px] font-extrabold text-[#157954] uppercase tracking-widest">
              Administrative Portal
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="w-full max-w-md bg-gradient-form-card border border-[#157954]/50 rounded-2xl p-8 shadow-xl text-white relative z-10"
      >
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#C7CEE8]/30">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D0D34D]" />
              <span>Admin Portal Access</span>
            </h2>
            <p className="text-xs text-[#C7CEE8] mt-1 font-medium">
              Sign in with your department admin credentials
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#D0D34D]/20 border border-[#D0D34D]/40 text-[#D0D34D] text-[10px] font-extrabold uppercase tracking-wider">
            Secured
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username / Employee ID */}
          <div>
            <label className="block text-xs font-bold text-[#C7CEE8] mb-2 uppercase tracking-wider">
              Username or Employee ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C7CEE8]/60">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. superadmin or pubadmin_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#21263A]/80 border border-[#C7CEE8]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#C7CEE8]/50 focus:outline-none focus:border-[#D0D34D] focus:ring-1 focus:ring-[#D0D34D] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#C7CEE8] mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C7CEE8]/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#21263A]/80 border border-[#C7CEE8]/30 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-[#C7CEE8]/50 focus:outline-none focus:border-[#D0D34D] focus:ring-1 focus:ring-[#D0D34D] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#C7CEE8]/60 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#D0D34D] hover:bg-[#c3c642] text-[#21263A] font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#21263A]" />
                <span>Authenticating ...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Sample Logins */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#C7CEE8]/30">
            <span className="text-[10px] font-bold text-[#C7CEE8] uppercase tracking-wider text-center">Quick Fill Sample Logins</span>
            <div className="grid grid-cols-2 gap-2">
               <button 
                 type="button" 
                 onClick={() => { setUsername("superadmin"); setPassword("adminpassword123"); }} 
                 className="py-2 text-xs font-semibold text-[#C7CEE8] bg-[#21263A]/60 border border-[#C7CEE8]/20 rounded-lg hover:text-white hover:bg-[#21263A] transition-colors cursor-pointer"
               >
                  Super Admin
               </button>
               <button 
                 type="button" 
                 onClick={() => { setUsername("pubadmin_admin"); setPassword("deptpassword123"); }} 
                 className="py-2 text-xs font-semibold text-[#C7CEE8] bg-[#21263A]/60 border border-[#C7CEE8]/20 rounded-lg hover:text-white hover:bg-[#21263A] transition-colors cursor-pointer"
               >
                  Dept Admin
               </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Footer Return Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center text-xs text-[#21263A] relative z-10"
      >
        <Link href="/" className="hover:text-[#157954] transition-colors font-medium underline underline-offset-4">
          ← Back to GovSewana Public Site
        </Link>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            <span className="text-sm font-medium">Loading Admin Portal...</span>
          </div>
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
