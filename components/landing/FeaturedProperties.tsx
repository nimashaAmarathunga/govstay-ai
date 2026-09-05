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
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#21263A] mb-3">
            Featured Properties
          </h2>
          <p className="text-[#21263A]/70 text-lg font-medium">
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
                <div className="bg-gradient-bungalow-card rounded-[24px] border border-[#157954]/40 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">
                  {/* Image Container */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <Image
                      src={property.image}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#21263A]/60 to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md">
                      <Star className="w-4 h-4 fill-[#D0D34D] text-[#157954]" />
                      <span className="text-sm font-extrabold text-[#21263A]">
                        {property.rating}
                      </span>
                    </div>

                    {/* Department Tag */}
                    <div className="absolute bottom-3 left-3 bg-[#D0D34D] text-[#21263A] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                      {property.department}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="font-extrabold text-white mb-2 line-clamp-2 text-lg group-hover:text-[#D0D34D] transition-colors">
                      {property.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[#C7CEE8] text-sm mb-4 font-medium">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-[#D0D34D]" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-3 mt-auto pt-4 border-t border-white/10 text-xs font-semibold text-[#C7CEE8]">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#D0D34D]" />
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
            className="inline-flex items-center gap-2 bg-[#21263A] text-[#D0D34D] px-8 py-4 rounded-full font-bold hover:bg-[#157954] hover:text-white transition-all duration-300 shadow-md"
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
