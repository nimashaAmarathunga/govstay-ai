"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "GovSewana made finding accommodation for my family vacation incredibly easy. The AI assistant understood exactly what I was looking for, and we booked within minutes.",
    author: "Ravi Kumarasinghe",
    role: "District Secretary",
    avatar: "🧑‍💼",
  },
  {
    quote:
      "The interactive map feature is fantastic! I could see all available properties and nearby attractions at a glance. Definitely using GovSewana again.",
    author: "Lakshmi Perera",
    role: "Government Officer",
    avatar: "👩‍💼",
  },
  {
    quote:
      "As someone who travels frequently for work, having verified government accommodations with special employee rates is a game-changer. Highly recommended!",
    author: "Chaminda Silva",
    role: "Ministry Official",
    avatar: "👨‍💼",
  },
  {
    quote:
      "The booking process was smooth and the customer support team was incredibly helpful. The property was exactly as described. Great experience overall!",
    author: "Anjali Jayawarden",
    role: "Senior Officer",
    avatar: "👩‍🦰",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = () => {
    setActiveIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            What Our Users Say
          </h2>
          <p className="text-slate-500 text-lg">
            Real feedback from government employees who love GovSewana
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPrevious}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-all duration-300 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Testimonials */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 shadow-sm"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-500 text-amber-500"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg md:text-xl text-slate-700 font-medium mb-6 leading-relaxed italic">
                    "{testimonials[activeIndex].quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {testimonials[activeIndex].avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {testimonials[activeIndex].author}
                      </p>
                      <p className="text-sm text-slate-500">
                        {testimonials[activeIndex].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNext}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-all duration-300 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Dot Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-2 mt-8"
          >
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? "bg-slate-900 w-8"
                    : "bg-slate-300 w-2 hover:bg-slate-400"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
