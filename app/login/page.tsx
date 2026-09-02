"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
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
  ShieldCheck,
  Loader2,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import { useUser, AppUser } from "@/components/context/UserContext";

type AuthTab = "login" | "register";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActiveUser, refreshUsers, checkAuthSession } = useUser();

  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/bookings";
  const initialTab = (searchParams.get("tab") as AuthTab) || "login";
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  // Sync tab with URL search parameter if modified externally
  useEffect(() => {
    const tabParam = searchParams.get("tab") as AuthTab;
    if (tabParam && (tabParam === "login" || tabParam === "register")) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

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

  // ---------------------------------------------------------------------------
  // Register State & Handlers
  // ---------------------------------------------------------------------------
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regEmpId, setRegEmpId] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError("Full name is required.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setRegError("Password must be at least 8 characters long.");
      return;
    }

    setRegLoading(true);

    try {
      const finalUsername = regUsername.trim() || regEmail.split("@")[0];
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          emailAddress: regEmail.trim(),
          username: finalUsername,
          password: regPassword,
          role: "GOV_EMPLOYEE",
          empId: regEmpId.trim() || undefined,
          status: "WORKING",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Failed to create account.");
        setRegLoading(false);
        return;
      }

      setRegSuccess("Account registered! Signing you in...");

      // Automatically authenticate to establish JWT session
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: finalUsername,
          password: regPassword,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        await refreshUsers();
        setActiveUser(loginData.user as AppUser);
      } else {
        await refreshUsers();
        setActiveUser(data as AppUser);
      }

      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Register submission error:", err);
      setRegError("Failed to register user. Please try again.");
    } finally {
      setRegLoading(false);
    }
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
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
              <span>User Portal Access</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in or register with your government ID
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            Secured
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 mb-6">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all cursor-pointer z-10 ${
              activeTab === "login"
                ? "text-slate-900 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all cursor-pointer z-10 ${
              activeTab === "register"
                ? "text-slate-900 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>

          {/* Animated Pill Indicator */}
          <motion.div
            layout
            className="absolute inset-y-1 rounded-xl bg-white shadow-sm border border-slate-200/80"
            initial={false}
            animate={{
              left: activeTab === "login" ? "4px" : "50%",
              width: "calc(50% - 4px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.div
              key="login-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
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
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset link sent to your registered email.")}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
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
                    <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
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

              {/* Quick Credentials Preset (Demo Helper) */}
              <div className="mt-6 pt-5 border-t border-slate-100">
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
          ) : (
            <motion.div
              key="register-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {regError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{regError}</span>
                </motion.div>
              )}

              {regSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{regSuccess}</span>
                </motion.div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anura Bandara"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="anura@gov.lk"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                  </div>
                </div>

                {/* Username & Emp ID Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="anura_b"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      placeholder="245599C"
                      value={regEmpId}
                      onChange={(e) => setRegEmpId(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99] mt-2"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
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
