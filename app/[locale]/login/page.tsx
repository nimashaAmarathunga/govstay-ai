"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActiveUser, checkAuthSession } = useUser();

  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/bookings";
  const initialTab = searchParams.get("tab") || "login";

  useEffect(() => {
    if (initialTab === "register") {
      router.push("/id-upload");
    }
  }, [initialTab, router]);

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
        setLoginError(data.error || t("invalidCredentials"));
        setLoginLoading(false);
        return;
      }

      setLoginSuccess(t("loginSuccess"));
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-slate-900 selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative h-12 w-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
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
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
              {t("userLoginTitle")}
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
              <span>{t("userLoginTitle")}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t("userLoginSubtitle")}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            Secured
          </span>
        </div>

        {/* Tab Switcher: Sign In vs Register (Redirects to ID Upload) */}
        <div className="relative flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 mb-6">
          <button
            type="button"
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all font-bold text-slate-900 bg-white shadow-sm border border-slate-200/80 cursor-default"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t("signInButton")}</span>
          </button>

          <Link
            href="/id-upload"
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all text-slate-500 hover:text-slate-900 font-medium hover:bg-slate-200/50 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t("registerNow")}</span>
          </Link>
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
              {t("usernameLabel")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. ravidu_245503b or 245503B"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t("passwordLabel")}
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset link sent to your registered email.")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {t("forgotPassword")}
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
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
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
              <span className="text-xs text-slate-600 font-medium">{t("rememberMe")}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99] mt-2"
          >
            {loginLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("signingIn")}</span>
              </>
            ) : (
              <>
                <span>{t("signInButton")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* New User Register CTA Card */}
        <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{t("noAccount")}</p>
              <p className="text-[11px] text-slate-500 truncate">Upload ID & register in 1 step</p>
            </div>
          </div>
          <Link
            href="/id-upload"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{t("registerNow")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Credentials Preset (Demo Helper) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Development Quick-Fill Credentials:</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("ravidu_245503b", "userpassword123")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all group flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Gov Employee (Wildlife Dept)
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ravidu_245503b / userpassword123
                </p>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("kasun_public", "publicpassword123")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all group flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Public User
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  kasun_public / publicpassword123
                </p>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
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
