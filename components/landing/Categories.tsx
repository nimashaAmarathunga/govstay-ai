"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Zap,
  DollarSign,
  Waves,
  Mountain,
  Leaf,
} from "lucide-react";

const categories = [
  {
    icon: Mountain,
    label: "Mountain Retreats",
    query: "mountain",
    color: "bg-slate-100 text-slate-900",
  },
  {
    icon: Waves,
    label: "Beach Escapes",
    query: "beach",
    color: "bg-blue-100 text-blue-900",
  },
  {
    icon: Leaf,
    label: "Nature Lodges",
    query: "nature",
    color: "bg-emerald-100 text-emerald-900",
  },
  {
    icon: Zap,
    label: "Quick Getaway",
    query: "weekend",
    color: "bg-amber-100 text-amber-900",
  },
  {
    icon: DollarSign,
    label: "Budget Friendly",
    query: "budget",
    color: "bg-green-100 text-green-900",
  },
  {
    icon: MapPin,
    label: "Popular Now",
    query: "trending",
    color: "bg-rose-100 text-rose-900",
  },
];

export function Categories() {
  const router = useRouter();

  const handleCategoryClick = (query: string) => {
    router.push(`/browse?filter=${encodeURIComponent(query)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Explore by Category
          </h2>
          <p className="text-slate-500 text-lg">
            Browse our collection by your preferred type of accommodation
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category.query)}
                className={`${category.color} rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-md border border-transparent hover:border-slate-200`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs md:text-sm font-semibold text-center">
                  {category.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
