import { prisma } from "@/lib/prisma";
import BrowseBungalowsClient, { DbBungalow } from "./BrowseBungalowsClient";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const bungalowsFromDb = await prisma.circuitBungalow.findMany({
    include: {
      rooms: true,
      caretaker: true,
    },
    orderBy: { name: "asc" },
  });

  const bungalows: DbBungalow[] = bungalowsFromDb.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    location: b.location,
    noOfRooms: b.noOfRooms,
    department: b.department,
    price: b.price,
    image: b.image,
    description: b.description,
    rating: b.rating,
    amenities: b.amenities,
    highlights: b.highlights,
    capacity: b.capacity,
    caretaker: b.caretaker
      ? {
          id: b.caretaker.id,
          name: b.caretaker.name,
          address: b.caretaker.address,
          telephoneNo: b.caretaker.telephoneNo,
          emailAddress: b.caretaker.emailAddress,
        }
      : null,
    rooms: b.rooms.map((r) => ({
      id: r.id,
      roomNumber: r.roomNumber,
      roomType: r.roomType as "AC" | "NON_AC",
      items: r.items,
      noOfBeds: r.noOfBeds,
    })),
  }));

  return <BrowseBungalowsClient bungalows={bungalows} />;
}
