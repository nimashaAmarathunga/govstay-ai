"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface HeroProps {
  onSearchClick?: () => void;
}

export function Hero({ onSearchClick }: HeroProps) {
  const tAbout = useTranslations("About");
  const tNav = useTranslations("Navigation");

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Subtle background pattern - using simple dots */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-center gap-2"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            GovSewana
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          {tAbout("title")}
          <span className="block text-emerald-400 mt-2 text-2xl md:text-3xl font-semibold">{tAbout("subtitle")}</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          {tAbout("description")}
        </motion.p>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white rounded-full px-2 py-2 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.15)] max-w-xl mx-auto backdrop-blur-sm">
            <div className="flex-1 flex items-center gap-3 pl-4">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="GovSewana AI Assistant..."
                className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-sm md:text-base"
                readOnly
              />
            </div>
            <Link
              href="/"
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>{tNav("home")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <span>{tNav("home")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
