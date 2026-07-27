"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Agent Assistant", href: "/" },
    { name: "Browse", href: "/browse" },
    { name: "Map View", href: "/map" },
    { name: "My Bookings", href: "/bookings" },
    { name: "My Profile", href: "/profile" },
    { name: "Admin Panel", href: "/admin" },
  ];

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
          {navLinks.map((link) => {
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
        <button className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100 cursor-pointer">
           <span className="material-symbols-outlined">help_outline</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer">
           <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGCXl0kYkpoLHHx0G_49GPuQztc4VopnoiFgKFM_wr71bz39PeikWIGXi8W-a3OIJ4dt9TUW1SrWN4xHp3qxcsHuKPihaTSA4dK6Swgq11R36yHsueOmIDeUDvwe9t0Wb67HkoK87Ka9cWAQHU7o9mb_QM0l9HNZ-A_6zkhW72NfAbO19JnNlWwPkn4-OqnsYMzyWehYs3B2dkVC2vskOW2PoqFPtelLviBm35-TgFZYO1RVt3z15f" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
