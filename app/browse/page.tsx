import { prisma } from "@/lib/prisma";
import BrowseBungalowsClient, { DbBungalow } from "./BrowseBungalowsClient";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const bungalowsFromDb = await prisma.circuitBungalow.findMany({
    include: {
      rooms: {
        select: { price: true }
      },
      caretaker: true,
    },
    orderBy: { name: "asc" },
  });

  const bungalows: DbBungalow[] = bungalowsFromDb.map((b) => {
    const startingPrice = b.rooms.length > 0 ? Math.min(...b.rooms.map(r => r.price)) : 0;
    
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      location: b.location,
      noOfRooms: b.noOfRooms,
      department: b.department,
      price: startingPrice,
      image: b.image,
      description: b.description,
      rating: b.rating,
      amenities: b.amenities,
      highlights: b.highlights,
      capacity: b.capacity,
    };
  });

  return <BrowseBungalowsClient bungalows={bungalows} />;
}
