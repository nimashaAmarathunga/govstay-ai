"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export function MapPreview() {
  const t = useTranslations("Map");

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
                alt="Interactive map of circuit bungalows across Sri Lanka"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-slate-900 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                {t("title")}
              </h2>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {t("subtitle")}
            </p>

            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition-all duration-300 hover:shadow-lg cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>{t("title")}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
