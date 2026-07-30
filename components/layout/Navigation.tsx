"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMode } from "@/components/context/ModeContext";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useMode();

  const allNavLinks = [
    { name: "Agent Assistant", href: "/" },
    { name: "Browse", href: "/browse" },
    { name: "Map View", href: "/map" },
    { name: "My Bookings", href: "/bookings" },
    { name: "Admin Panel", href: "/admin" },
    { name: "My Profile", href: "/profile" },
  ];

  const visibleNavLinks = allNavLinks.filter((link) => {
    if (mode === "admin" && link.name === "My Profile") return false;
    if (mode === "user" && link.name === "Admin Panel") return false;
    return true;
  });

  const handleModeChange = (newMode: "user" | "admin") => {
    setMode(newMode);
    if (newMode === "user" && pathname === "/admin") {
      router.push("/");
    } else if (newMode === "admin" && pathname === "/profile") {
      router.push("/admin");
    }
  };

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
        {/* Admin Mode & User Mode Toggle Buttons */}
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
        </div>

        <button className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100 cursor-pointer">
           <span className="material-symbols-outlined">help_outline</span>
        </button>

        {/* User Profile avatar section - hidden when in Admin Mode */}
        {mode === "user" && (
          <Link href="/profile" title="My Profile" className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all block">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGCXl0kYkpoLHHx0G_49GPuQztc4VopnoiFgKFM_wr71bz39PeikWIGXi8W-a3OIJ4dt9TUW1SrWN4xHp3qxcsHuKPihaTSA4dK6Swgq11R36yHsueOmIDeUDvwe9t0Wb67HkoK87Ka9cWAQHU7o9mb_QM0l9HNZ-A_6zkhW72NfAbO19JnNlWwPkn4-OqnsYMzyWehYs3B2dkVC2vskOW2PoqFPtelLviBm35-TgFZYO1RVt3z15f" alt="Profile" className="w-full h-full object-cover" />
          </Link>
        )}
      </div>
    </header>
  );
}
