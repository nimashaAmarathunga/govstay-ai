"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function SearchBanner() {
  const t = useTranslations("SearchBanner");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            {t("searchButton")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("quickFilter")}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSearch}
          className="flex gap-3"
        >
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter location, bungalow name, or department..."
              className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all text-base font-medium"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm"
        >
          <span className="text-slate-500">{t("quickFilter")}</span>
          <div className="flex flex-wrap gap-3 justify-center">
            {["Nuwara Eliya", "Kandy", "Galle", "Ella"].map((location) => (
              <button
                key={location}
                onClick={() => {
                  setSearchQuery(location);
                  router.push(
                    `/browse?search=${encodeURIComponent(location)}`
                  );
                }}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-full transition-all font-medium cursor-pointer"
              >
                {location}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
