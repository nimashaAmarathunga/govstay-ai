"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMode, AppMode } from "@/components/context/ModeContext";
import {
  useUser,
  AppUser,
  roleLabel,
  roleBadgeClass,
  userInitial,
} from "@/components/context/UserContext";
import {
  Building2,
  User,
  ShieldCheck,
  Terminal,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Settings,
  Lock,
  LogOut,
  Sparkles,
  LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useMode();
  const { users, activeUser, setActiveUser, logout, isLoading } = useUser();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (dropdownOpen || settingsOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen, settingsOpen]);

  // Close dropdowns when mode or route changes
  useEffect(() => {
    setDropdownOpen(false);
    setSettingsOpen(false);
  }, [mode, pathname]);

  // Main navigation links
  const publicNavLinks = [
    { name: "Browse", href: "/browse" },
    { name: "Map View", href: "/map" },
  ];

  const authNavLinks = [
    { name: "My Bookings", href: "/bookings" },
    { name: "GovSewana Support", href: "/agent" },
  ];

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);

    if (activeUser) {
      const isAdminRole = activeUser.role === "DEPT_ADMIN" || activeUser.role === "SUPER_ADMIN";
      const isUserRole = activeUser.role === "GOV_EMPLOYEE" || activeUser.role === "PUBLIC_USER";

      if (newMode === "admin" && !isAdminRole) {
        setActiveUser(null);
      } else if (newMode === "user" && !isUserRole) {
        setActiveUser(null);
      }
    }

    if (newMode === "user" && pathname === "/admin") router.push("/");
    else if (newMode === "admin" && pathname !== "/admin") router.push("/admin");
  };

  const dropdownUsers = users.filter((u) => {
    if (mode === "user") return u.role === "GOV_EMPLOYEE" || u.role === "PUBLIC_USER";
    if (mode === "admin") return u.role === "DEPT_ADMIN" || u.role === "SUPER_ADMIN";
    return false;
  });

  const showDropdown = mode === "user" || mode === "admin";

  const handleSelectUser = (user: AppUser) => {
    setActiveUser(user);
    setDropdownOpen(false);
    if (mode === "user") {
      router.push("/bookings");
    } else if (mode === "admin") {
      router.push("/admin");
    }
  };

  const handleUserLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setActiveUser(null);
    setSettingsOpen(false);
    router.push("/admin/login");
    router.refresh();
  };

  const avatarContent = activeUser ? (
    <span className="text-sm font-semibold text-white select-none leading-none">
      {userInitial(activeUser.name)}
    </span>
  ) : (
    <User className="w-5 h-5 text-slate-500" />
  );

  const avatarBg = activeUser ? "bg-slate-900" : "bg-white border border-slate-200";
  const dropdownHeader = mode === "user" ? "Account / Switch User" : "Admin Profiles";
  const isAdminUser = activeUser && (activeUser.role === "DEPT_ADMIN" || activeUser.role === "SUPER_ADMIN");

  return (
    <header className="flex-none h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 z-50 sticky top-0">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-10 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="GovSewana Logo"
              fill
              className="object-contain mix-blend-multiply"
              priority
            />
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">GovSewana</h1>
        </Link>

        <nav className="hidden md:flex items-center gap-1 h-16">
          {/* Public Links */}
          {publicNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 h-full flex items-center text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-slate-900 font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          {/* Authenticated Links (Only visible if logged in) */}
          {activeUser && authNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 h-full flex items-center text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-slate-900 font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Auth Buttons for Unauthenticated Users */}
        {!activeUser && (
          <div className="flex items-center gap-2 mr-2">
            <Link
              href="/login"
              className="px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              Register
            </Link>
          </div>
        )}

        {/* Profile / Account Selector Dropdown */}
        {activeUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
            >
              <div className={`h-7 w-7 rounded-full flex items-center justify-center ${avatarBg}`}>
                {avatarContent}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-50">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      My Account
                    </p>
                    <div className="mt-1">
                      <p className="text-[13px] font-bold text-slate-900 truncate">
                        {activeUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        @{activeUser.username} {activeUser.empId ? `(ID: ${activeUser.empId})` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Profile & Actions */}
                  <div className="p-2 border-t border-slate-50 space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-50">
                    <button
                      onClick={handleUserLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Settings Icon (Right Corner) - Admin Login & App Options */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
              settingsOpen 
                ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/30" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
            }`}
            title="App Settings & Admin Login"
            aria-label="Settings and Admin Login"
          >
            <Settings className={`w-5 h-5 transition-transform duration-300 ${settingsOpen ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2.5"
              >
                {/* Header */}
                <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Application Settings
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Admin Portal
                  </span>
                </div>

                {/* Admin Portal / Login Entry */}
                <div className="space-y-1">
                  <Link
                    href="/admin/login"
                    onClick={() => setSettingsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all group shadow-sm cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>Admin Portal Login</span>
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      </h4>
                      <p className="text-[10px] text-slate-300 group-hover:text-blue-100 truncate mt-0.5">
                        Department & Super Admin access
                      </p>
                    </div>
                  </Link>

                  {isAdminUser && (
                    <button
                      onClick={handleAdminLogout}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left text-xs font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0 text-red-500" />
                      <span>Sign Out Admin Session</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
