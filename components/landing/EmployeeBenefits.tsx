"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Users, Award, Zap } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: CheckCircle2,
    title: "Government Verified",
    description:
      "All properties are officially registered and maintained to the highest standards.",
  },
  {
    icon: Users,
    title: "Employee Exclusive",
    description:
      "Special rates and benefits available only for government employees and their families.",
  },
  {
    icon: Award,
    title: "Priority Support",
    description:
      "Dedicated support team ensures smooth bookings and hassle-free stays.",
  },
];

export function EmployeeBenefits() {
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
    <section className="py-12 md:py-16 lg:py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Left Column - Heading & Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Designed for Public Servants
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              GovStay is engineered specifically for Sri Lankan government employees
              and their families. We understand the pain of manual administrative processes, which is why we built an AI layer to handle verification, scheduling, and notifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg text-center"
              >
                Chat with Agent Assistant
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Benefits Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50">
                        <Icon className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 text-base">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
