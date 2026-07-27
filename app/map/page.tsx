import React from "react";
import { prisma } from "@/lib/prisma";
import MapWrapper from "@/components/map/MapWrapper";
import { BungalowMarker } from "@/components/map/InteractiveMap";

export default async function MapPage() {
  // Fetch real bungalow locations from the database
  const circuitBungalows = await prisma.circuitBungalow.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      location: true,
      latitude: true,
      longitude: true,
      image: true,
      department: true,
      rooms: {
        select: {
          price: true,
        },
      },
    },
  });

  // Map to the format expected by the InteractiveMap component
  const bungalows: BungalowMarker[] = circuitBungalows.map((b) => {
    // Calculate the lowest starting price among all rooms in the bungalow
    const startingPrice = b.rooms.length > 0 
      ? Math.min(...b.rooms.map((r) => r.price)) 
      : 0;

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      location: b.location,
      latitude: b.latitude,
      longitude: b.longitude,
      price: startingPrice,
      image: b.image,
      department: b.department,
    };
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Real Map Visual Container with Filters */}
      <div className="flex-1 relative min-h-[calc(100vh-64px)] w-full border-t border-slate-200 z-0">
        <MapWrapper bungalows={bungalows} />
      </div>
    </div>
  );
}
