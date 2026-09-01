"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Briefcase
} from "lucide-react";
import { useUser, AppUser } from "@/components/context/UserContext";

type AuthTab = "login" | "register";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActiveUser, refreshUsers } = useUser();

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginIdentifier.trim()) {
      setLoginError("Please enter your email or username.");
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
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Login failed. Please check your credentials.");
        setLoginLoading(false);
        return;
      }

      setLoginSuccess("Successfully authenticated! Redirecting...");
      setActiveUser(data.user as AppUser);

      setTimeout(() => {
        router.push("/bookings");
      }, 1000);
    } catch (err) {
      console.error(err);
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
    if (!regPassword || regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          emailAddress: regEmail,
          username: regUsername || regEmail.split("@")[0],
          password: regPassword,
          role: "GOV_EMPLOYEE",
          empId: regEmpId || undefined,
          status: "WORKING",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Failed to create account.");
        setRegLoading(false);
        return;
      }

      setRegSuccess("Account registered successfully! Logging you in...");
      await refreshUsers();
      setActiveUser(data as AppUser);

      setTimeout(() => {
        router.push("/bookings");
      }, 1200);
    } catch (err) {
      console.error(err);
      setRegError("Failed to register user. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-full flex-1 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Header Logo & Title */}
          <div className="flex items-center justify-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
            <div className="h-10 w-10 relative flex items-center justify-center rounded-xl bg-white/10 p-1 border border-white/10 shrink-0">
              <Image
                src="/logo.png"
                alt="GovSewana Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">GovSewana</h2>
              <p className="text-xs text-slate-400 font-medium">Account Portal</p>
            </div>
          </div>

          {/* TAB CONTROLLER */}
          <div className="relative flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer z-10 ${
                activeTab === "login" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer z-10 ${
                activeTab === "register" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            {/* Animated Pill Indicator */}
            <motion.div
              layout
              className="absolute inset-y-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
              initial={false}
              animate={{
                left: activeTab === "login" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          {/* TAB CONTENT ANIMATION WRAPPER */}
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login-tab"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Error Banner */}
                  {loginError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Success Banner */}
                  {loginSuccess && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{loginSuccess}</span>
                    </div>
                  )}

                  {/* EMAIL / USERNAME SECTION */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Enter your email or username"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* PASSWORD SECTION */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link sent to your email.")}
                        className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* REMEMBER ME CHECKBOX */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-xs text-slate-400">Remember me</span>
                    </label>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {loginLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* FOOTER SWITCH TO REGISTER */}
                <div className="mt-6 text-center pt-2 border-t border-slate-800/80">
                  <p className="text-xs text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("register")}
                      className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors cursor-pointer ml-1"
                    >
                      Register
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Error Banner */}
                  {regError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Success Banner */}
                  {regSuccess && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  {/* FULL NAME */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* USERNAME & EMP ID ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Username</label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Gov Employee ID</label>
                      <input
                        type="text"
                        value={regEmpId}
                        onChange={(e) => setRegEmpId(e.target.value)}
                        placeholder="Employee ID"
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full pl-9 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* REGISTER SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {regLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* FOOTER SWITCH TO LOGIN */}
                <div className="mt-5 text-center pt-2 border-t border-slate-800/80">
                  <p className="text-xs text-slate-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("login")}
                      className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors cursor-pointer ml-1"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-full flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading Auth Portal...</span>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
