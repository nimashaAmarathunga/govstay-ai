"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users } from "lucide-react";

interface DbBungalow {
  id: string;
  slug: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  capacity: number;
  noOfRooms: number;
  department: string;
}

interface FeaturedPropertiesProps {
  properties?: DbBungalow[];
  limit?: number;
}

export function FeaturedProperties({
  properties = [],
  limit = 4,
}: FeaturedPropertiesProps) {
  const displayProperties = properties.slice(0, limit);

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

  if (displayProperties.length === 0) {
    return null;
  }

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
            Featured Properties
          </h2>
          <p className="text-slate-500 text-lg">
            Discover our most popular circuit bungalows
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {displayProperties.map((property) => (
            <motion.div
              key={property.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={`/browse/${property.slug}`}>
                <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">
                  {/* Image Container */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <Image
                      src={property.image}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-900">
                        {property.rating}
                      </span>
                    </div>

                    {/* Department Tag */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {property.department}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg">
                      {property.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{property.capacity} guests</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>•</span>
                        <span>{(property as any).rooms && (property as any).rooms.length > 0 ? (property as any).rooms.length : property.noOfRooms} rooms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 md:mt-12"
        >
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
          >
            View All Properties
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
