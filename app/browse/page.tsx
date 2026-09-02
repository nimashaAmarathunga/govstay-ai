import { prisma } from "@/lib/prisma";
import BrowseBungalowsClient, { DbBungalow } from "./BrowseBungalowsClient";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const bungalowsFromDb = await prisma.circuitBungalow.findMany({
    include: {
      rooms: {
        orderBy: { roomNumber: 'asc' }
      },
      caretaker: true,
      bookings: {
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] }
        }
      }
    },
    orderBy: { name: "asc" },
  });

  const bungalows: DbBungalow[] = bungalowsFromDb.map((b: any) => {
    const startingPrice = b.rooms.length > 0 ? Math.min(...b.rooms.map((r: any) => r.price)) : 0;
    
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
      caretaker: b.caretaker,
      rooms: b.rooms.map((r: any) => ({
        id: r.id,
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        items: r.items,
        noOfBeds: r.noOfBeds,
        bed_count: r.bed_count,
        capacity: r.capacity,
        price: r.price
      })),
      bookings: b.bookings.map((bk: any) => ({
        id: bk.id,
        roomId: bk.roomId,
        fromDate: bk.fromDate.toISOString(),
        toDate: bk.toDate.toISOString(),
        status: bk.status
      }))
    };
  });

  return <BrowseBungalowsClient bungalows={bungalows} />;
}
