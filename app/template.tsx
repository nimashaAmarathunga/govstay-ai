"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="flex-1 flex flex-col min-h-0 h-full w-full"
    >
      {children}
    </motion.div>
  );
}
