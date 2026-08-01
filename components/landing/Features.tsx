"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  MapPin,
  Calendar,
  Shield,
  Building2,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Zero Paperwork",
    description:
      "Say goodbye to manual forms and endless waiting. Upload your payment slip and let our system verify it instantly.",
  },
  {
    icon: Shield,
    title: "Guaranteed Availability",
    description:
      "Our automated booking engine ensures your selected dates are locked in, completely preventing double-bookings.",
  },
  {
    icon: Clock,
    title: "Instant Verification",
    description:
      "Your uploaded payment slips are read and verified asynchronously within seconds, getting your booking confirmed faster.",
  },
  {
    icon: Building2,
    title: "AI Travel Assistant",
    description:
      "Not sure where to go? Simply ask the Agent Assistant for recommendations based on your preferences and budget.",
  },
  {
    icon: Calendar,
    title: "Streamlined Approvals",
    description:
      "Automated compliance checks mean Department Admins only need to intervene when absolutely necessary.",
  },
  {
    icon: MapPin,
    title: "WhatsApp Updates",
    description:
      "Stay in the loop with real-time WhatsApp notifications about your booking status and property caretaker details.",
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Why Use GovStay?
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Making government accommodation booking simpler, faster, and more transparent.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-slate-900" />
                </div>

                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-600 text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
