"use client";

import React, { useEffect, useState } from "react";
import {
  Hero,
  FeaturedProperties,
  SearchBanner,
  Features,
  EmployeeBenefits,
  MapPreview,
  CTA,
  Footer,
} from "@/components/landing";

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

export default function LandingPage() {
  const [featuredProperties, setFeaturedProperties] = useState<DbBungalow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bungalows for featured section
        const res = await fetch("/api/bungalows");
        if (res.ok) {
          const data = await res.json();
          // Get first 4 bungalows as featured
          setFeaturedProperties(data.slice(0, 4) || []);
        }
      } catch (error) {
        console.error("Error fetching bungalows:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Featured Properties Section */}
      {!loading && featuredProperties.length > 0 && (
        <FeaturedProperties properties={featuredProperties} limit={4} />
      )}

      {/* Search Banner Section */}
      <SearchBanner />

      {/* Map Preview Section */}
      <MapPreview />

      {/* Employee Benefits Section */}
      <EmployeeBenefits />

      {/* Features Section */}
      <Features />

      {/* Final CTA Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}