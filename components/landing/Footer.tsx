"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Mail, Phone } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Browse", href: "/browse" },
      { label: "Map View", href: "/map" },
      { label: "My Bookings", href: "/bookings" },
      { label: "Admin Panel", href: "/admin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  },
];

export function Footer() {
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
    <footer className="bg-gradient-palette-5 text-white border-t border-[#157954]/30">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-10 pb-10 border-b border-[#C7CEE8]/20">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative h-9 w-9 bg-white p-1 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                <Image
                  src="/logo_new.png"
                  alt="GovSewana Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-white">GovSewana</h3>
            </Link>
            <p className="text-[#C7CEE8] text-sm leading-relaxed font-medium">
              Discover and book verified government accommodations across Sri
              Lanka with ease.
            </p>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {footerSections.map((section, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <h4 className="font-extrabold text-[#D0D34D] mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className="text-[#C7CEE8] hover:text-white transition-colors duration-300 text-sm font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <h4 className="font-extrabold text-[#D0D34D] mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@govsewana.lk"
                  className="flex items-center gap-2 text-[#C7CEE8] hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  <Mail className="w-4 h-4 text-[#D0D34D]" />
                  support@govsewana.lk
                </a>
              </li>
              <li>
                <a
                  href="tel:+94112345678"
                  className="flex items-center gap-2 text-[#C7CEE8] hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  <Phone className="w-4 h-4 text-[#D0D34D]" />
                  +94 (11) 234-5678
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#C7CEE8]/80 font-medium"
        >
          <p>&copy; 2026 GovSewana. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
