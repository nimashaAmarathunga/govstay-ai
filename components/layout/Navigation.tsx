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
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useMode();
  const { users, activeUser, setActiveUser, isLoading } = useUser();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  // Also close dropdown when mode changes
  useEffect(() => {
    setDropdownOpen(false);
  }, [mode]);

  const allNavLinks = [
    { name: "Agent Assistant", href: "/" },
    { name: "Browse", href: "/browse" },
    { name: "Map View", href: "/map" },
    { name: "My Bookings", href: "/bookings" },
    { name: "Upload ID & Info", href: "/id-upload" },
    { name: "Admin Panel", href: "/admin" },
    { name: "My Profile", href: "/profile" },
  ];

  const visibleNavLinks = allNavLinks.filter((link) => {
    if (mode === "admin") return link.name === "Admin Panel";
    if (mode === "user") return link.name !== "Admin Panel";
    return true; // developer sees all
  });

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

  const avatarContent = activeUser ? (
    <span className="text-sm font-semibold text-white select-none leading-none">
      {userInitial(activeUser.name)}
    </span>
  ) : (
    <User className="w-5 h-5 text-slate-500" />
  );
  
  const avatarBg = activeUser ? "bg-slate-900" : "bg-white border border-slate-200";

  const dropdownHeader = mode === "user" ? "Select User / Employee" : "Select Admin";

  return (
    <header className="flex-none h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 z-50 sticky top-0">
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
          {visibleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 h-full flex items-center text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-slate-900"
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

      <div className="flex items-center gap-4">
        {/* Mode Toggle Buttons */}
        <div className="flex items-center p-1 bg-slate-50 rounded-xl border border-slate-100/60 gap-1">
          <button
            onClick={() => handleModeChange("user")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
              mode === "user"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to User Mode"
          >
            <User className="w-3.5 h-3.5" />
            <span>User</span>
          </button>
          <button
            onClick={() => handleModeChange("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
              mode === "admin"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to Admin Mode"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => handleModeChange("developer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
              mode === "developer"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Switch to Developer View"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer</span>
          </button>
        </div>

        <button className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-50 cursor-pointer">
          <HelpCircle className="w-5 h-5" />
        </button>

        {showDropdown && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none`}
            >
              <div className={`h-7 w-7 rounded-full flex items-center justify-center ${avatarBg}`}>
                {avatarContent}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
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
                      {dropdownHeader}
                    </p>
                    {activeUser && (
                      <p className="text-[13px] font-medium text-slate-900 mt-1 truncate">
                        Active: {activeUser.name}
                      </p>
                    )}
                  </div>

                  <ul className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
                    {isLoading ? (
                      <li className="px-4 py-6 text-center text-[13px] text-slate-400">Loading…</li>
                    ) : dropdownUsers.length === 0 ? (
                      <li className="px-4 py-6 text-center text-[13px] text-slate-400">
                        No {mode === "admin" ? "admins" : "users"} found.
                      </li>
                    ) : (
                      dropdownUsers.map((user) => {
                        const isSelected = activeUser?.id === user.id;
                        return (
                          <li key={user.id}>
                            <button
                              onClick={() => handleSelectUser(user)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
                              }`}
                            >
                              <div
                                className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                                  isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {userInitial(user.name)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-medium truncate ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                                  {user.name}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  @{user.username}{user.placeOfWork ? ` · ${user.placeOfWork}` : ""}
                                </p>
                              </div>

                              {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />}
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
