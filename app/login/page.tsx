"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  Loader2,
  BadgeCheck,
  FileCheck2,
} from "lucide-react";
import { useUser, AppUser } from "@/components/context/UserContext";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActiveUser, checkAuthSession } = useUser();

  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/browse";
  const initialTab = searchParams.get("tab") || "login";

  // If user navigated with tab=register, redirect to the register page
  useEffect(() => {
    if (initialTab === "register") {
      router.push("/register");
    }
  }, [initialTab, router]);

  // ---------------------------------------------------------------------------
  // Login State & Handlers
  // ---------------------------------------------------------------------------
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  const handleQuickFill = (identifier: string, pass: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginIdentifier.trim()) {
      setLoginError("Please enter your email, username, or Employee ID.");
      return;
    }
    if (!loginPassword) {
      setLoginError("Please enter your password.");
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Login failed. Please check your credentials.");
        setLoginLoading(false);
        return;
      }

      setLoginSuccess("Authenticated successfully! Redirecting...");
      setActiveUser(data.user as AppUser);
      await checkAuthSession();

      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("Login submission error:", err);
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#157954] selection:text-white">
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
              className="object-contain mix-blend-multiply"
              priority
            />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#21263A]">
              GovSewana
            </h1>
            <p className="text-[11px] font-extrabold text-[#157954] uppercase tracking-widest">
              User & Employee Portal
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="w-full max-w-md bg-gradient-form-card border border-[#157954]/50 rounded-2xl p-8 shadow-xl relative z-10 text-white"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-[#D0D34D]" />
              <span>User Portal Access</span>
            </h2>
            <p className="text-xs text-[#C7CEE8] mt-1 font-medium">
              Sign in with your verified government credentials
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#D0D34D] text-[#21263A] text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            Secured
          </span>
        </div>

        {/* Alerts */}
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{loginError}</span>
          </motion.div>
        )}

        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{loginSuccess}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Username / Employee ID */}
          <div>
            <label className="block text-xs font-bold text-[#C7CEE8] mb-2 uppercase tracking-wider">
              Email, Username or Employee ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C7CEE8]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. john_doe or 123456V"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full bg-[#21263A]/80 border border-[#157954]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D0D34D] focus:ring-2 focus:ring-[#D0D34D]/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#C7CEE8] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset link sent to your registered email.")}
                className="text-[11px] font-bold text-[#D0D34D] hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C7CEE8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#21263A]/80 border border-[#157954]/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D0D34D] focus:ring-2 focus:ring-[#D0D34D]/30 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#C7CEE8] hover:text-white transition-colors cursor-pointer"
                aria-label={showLoginPassword ? "Hide password" : "Show password"}
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 text-[#D0D34D] focus:ring-[#D0D34D] accent-[#D0D34D]"
              />
              <span className="text-xs text-[#C7CEE8] font-medium">Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 px-4 bg-[#D0D34D] hover:bg-[#b8bb3d] text-[#21263A] font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loginLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#21263A]" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4 text-[#21263A]" />
              </>
            )}
          </button>
        </form>

        {/* New User Register CTA Card */}
        <div className="mt-5 p-4 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-md bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">New to GovSewana?</p>
              <p className="text-[11px] text-slate-500 truncate">Create an account to book bungalows</p>
            </div>
          </div>
          <Link
            href="/register"
            className="px-3.5 py-2 rounded-md bg-brand-primary hover:bg-[#12242b] text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>


      </motion.div>

      {/* Footer Navigation Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center text-xs text-slate-500 relative z-10 flex items-center gap-4 justify-center"
      >
        <Link href="/" className="hover:text-slate-800 transition-colors font-medium underline underline-offset-4">
          ← Back to GovSewana Home
        </Link>
        <span className="text-slate-300">•</span>
        <Link href="/admin/login" className="hover:text-brand-primary transition-colors font-medium underline underline-offset-4">
          Admin Portal Login →
        </Link>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            <span className="text-sm font-medium">Loading User Portal...</span>
          </div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
