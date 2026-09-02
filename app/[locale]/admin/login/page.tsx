"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("AdminAuth");
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-slate-900 selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

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
              {t("portalLabel")}
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
      >
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              {t("title")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t("subtitle")}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            Secured
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="e.g. superadmin or pubadmin_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99] mt-2"
          >
            {isLoading ? (
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

        {/* Quick Credentials Preset (Demo Helper) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Development Quick-Fill Credentials:</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("superadmin", "adminpassword123")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all group flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Super Admin (Ministry DG)
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">superadmin / adminpassword123</p>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("pubadmin_admin", "deptpassword123")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all group flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Dept Admin (Public Admin)
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">pubadmin_admin / deptpassword123</p>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer Return Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center text-xs text-slate-500 relative z-10"
      >
        <Link href="/" className="hover:text-slate-800 transition-colors font-medium underline underline-offset-4">
          {t("backToSite")}
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
