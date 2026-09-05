"use client";

import React from "react";
import { motion } from "framer-motion";
import { Hotel, BedDouble, CalendarDays } from "lucide-react";

interface StatsGridProps {
  totalBungalows?: number;
  totalRooms?: number;
  totalBookings?: number;
}

export function Stats({
  totalBungalows = 24,
  totalRooms = 156,
  totalBookings = 342,
}: StatsGridProps) {
  const stats = [
    {
      icon: Hotel,
      label: "Circuit Bungalows",
      value: totalBungalows,
      color: "bg-brand-primary/5",
      iconColor: "text-brand-primary",
    },
    {
      icon: BedDouble,
      label: "Available Rooms",
      value: totalRooms,
      color: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      icon: CalendarDays,
      label: "Bookings Processed",
      value: totalBookings,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`${stat.color} rounded-md p-6 md:p-8 shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-5`}
              >
                <div className={`w-14 h-14 rounded-md ${stat.color} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                    {stat.value}+
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
