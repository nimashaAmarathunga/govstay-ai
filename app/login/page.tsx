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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-brand-primary selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 w-full h-[30vh] bg-brand-primary/5 pointer-events-none" />

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
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              GovSewana
            </h1>
            <p className="text-[11px] font-bold text-brand-primary uppercase tracking-widest">
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
        className="w-full max-w-md bg-white border border-slate-200 rounded-md p-8 shadow-sm relative z-10"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-brand-primary" />
              <span>User Portal Access</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your verified government credentials
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
            Secured
          </span>
        </div>



        {/* Alerts */}
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{loginError}</span>
          </motion.div>
        )}

        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{loginSuccess}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Username / Employee ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Email, Username or Employee ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. john_doe or 123456V"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset link sent to your registered email.")}
                className="text-[11px] font-semibold text-brand-primary hover:text-[#12242b] cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
              />
              <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 px-4 bg-brand-primary hover:bg-[#12242b] text-white font-bold text-sm rounded-md shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loginLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
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
        <Link href="/admin/login" className="hover:text-blue-600 transition-colors font-medium underline underline-offset-4">
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
