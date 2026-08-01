"use client";

import Link from "next/link";
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
    if (newMode === "user" && pathname === "/admin") router.push("/");
    else if (newMode === "admin" && pathname !== "/admin") router.push("/admin");
  };

  // ─── Filtered user lists by mode ─────────────────────────────────────────

  /** Users shown in the dropdown depend on the current mode */
  const dropdownUsers = users.filter((u) => {
    if (mode === "user") return u.role === "GOV_EMPLOYEE" || u.role === "PUBLIC_USER";
    if (mode === "admin") return u.role === "DEPT_ADMIN" || u.role === "SUPER_ADMIN";
    return false; // developer mode → no dropdown
  });

  /** Whether to show the dropdown trigger at all */
  const showDropdown = mode === "user" || mode === "admin";

  // ─── Click handler: navigate based on mode ───────────────────────────────
  const handleSelectUser = (user: AppUser) => {
    setActiveUser(user);
    setDropdownOpen(false);
    if (mode === "user") {
      // Navigate to bookings page for employees / public users
      router.push("/bookings");
    } else if (mode === "admin") {
      // Navigate to admin panel for admins
      router.push("/admin");
    }
  };

  // ─── Avatar display ───────────────────────────────────────────────────────
  const avatarContent = activeUser ? (
    <span className="text-sm font-bold text-white select-none leading-none">
      {userInitial(activeUser.name)}
    </span>
  ) : (
    <span className="material-symbols-outlined text-[20px] text-slate-500">person</span>
  );
  const avatarBg = activeUser ? "bg-blue-600" : "bg-slate-100 border border-slate-200";

  // ─── Dropdown label by mode ───────────────────────────────────────────────
  const dropdownHeader =
    mode === "user" ? "Select User / Employee" : "Select Admin";

  return (
    <header className="flex-none h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-white text-lg">holiday_village</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">GovSewana</h1>
        </div>

        <nav className="hidden md:flex items-center gap-1 h-16">
          {visibleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 h-full flex items-center text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Mode Toggle Buttons */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 gap-1">
          <button
            onClick={() => handleModeChange("user")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === "user"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
            title="Switch to User Mode"
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>User Mode</span>
          </button>
          <button
            onClick={() => handleModeChange("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === "admin"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
            title="Switch to Admin Mode"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Admin Mode</span>
          </button>
          <button
            onClick={() => handleModeChange("developer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === "developer"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
            title="Switch to Developer View"
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>Developer View</span>
          </button>
        </div>

        <button className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100 cursor-pointer">
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        {/* User / Admin Profile Dropdown — hidden in Developer Mode */}
        {showDropdown && (
          <div className="relative" ref={dropdownRef}>
            {/* Avatar trigger */}
            <button
              id="user-profile-dropdown-trigger"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 focus:outline-none ${avatarBg} ${
                mode === "admin"
                  ? "hover:ring-purple-500"
                  : "hover:ring-blue-500"
              }`}
              title={
                activeUser
                  ? `${mode === "admin" ? "Admin" : "User"}: ${activeUser.name}`
                  : mode === "admin"
                  ? "Select an admin"
                  : "Select a user"
              }
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {avatarContent}
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div
                id="user-profile-dropdown"
                role="listbox"
                aria-label={dropdownHeader}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in"
              >
                {/* Header */}
                <div className={`px-4 py-3 border-b border-slate-100 ${mode === "admin" ? "bg-purple-50" : "bg-slate-50"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${mode === "admin" ? "text-purple-400" : "text-slate-400"}`}>
                    {dropdownHeader}
                  </p>
                  {activeUser && (
                    <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">
                      Active: {activeUser.name}
                    </p>
                  )}
                </div>

                {/* User list */}
                <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {isLoading ? (
                    <li className="px-4 py-6 text-center text-sm text-slate-400">
                      Loading…
                    </li>
                  ) : dropdownUsers.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-slate-400">
                      No {mode === "admin" ? "admins" : "users"} found.
                    </li>
                  ) : (
                    dropdownUsers.map((user) => {
                      const isSelected = activeUser?.id === user.id;
                      const accentSelected =
                        mode === "admin"
                          ? "bg-purple-50"
                          : "bg-blue-50";
                      const accentText =
                        mode === "admin" ? "text-purple-700" : "text-blue-700";
                      const accentAvatar =
                        mode === "admin"
                          ? "bg-purple-600 text-white"
                          : "bg-blue-600 text-white";
                      const accentCheck =
                        mode === "admin" ? "text-purple-600" : "text-blue-600";

                      return (
                        <li key={user.id}>
                          <button
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelectUser(user)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                              isSelected ? accentSelected : "hover:bg-slate-50"
                            }`}
                          >
                            {/* Initial avatar */}
                            <div
                              className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                                isSelected ? accentAvatar : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {userInitial(user.name)}
                            </div>

                            {/* Name + username + workplace */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${
                                  isSelected ? accentText : "text-slate-800"
                                }`}
                              >
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                @{user.username}
                                {user.placeOfWork ? ` · ${user.placeOfWork}` : ""}
                              </p>
                            </div>

                            {/* Role badge */}
                            <span
                              className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeClass(user.role)}`}
                            >
                              {roleLabel(user.role)}
                            </span>

                            {/* Checkmark for active selection */}
                            {isSelected && (
                              <span
                                className={`material-symbols-outlined text-[18px] shrink-0 ${accentCheck}`}
                              >
                                check_circle
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>

                {/* Footer hint */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                  <p className="text-[11px] text-slate-400">
                    {mode === "user"
                      ? "Click a user to view their bookings"
                      : "Click an admin to view their dashboard"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
