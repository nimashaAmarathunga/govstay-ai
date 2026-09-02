import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BungalowDetailClient, { DbBungalowDetails } from "./BungalowDetailClient";

type BungalowDetailsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function BungalowDetailsPage({ params }: BungalowDetailsPageProps) {
  const { slug } = await params;

  const bungalow = await prisma.circuitBungalow.findUnique({
    where: { slug },
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
    }
  });

  if (!bungalow) {
    notFound();
  }

  const startingPrice = bungalow.rooms.length > 0 
    ? Math.min(...bungalow.rooms.map(r => r.price))
    : 0;

  const formattedBungalow: DbBungalowDetails = {
    id: bungalow.id,
    slug: bungalow.slug,
    name: bungalow.name,
    location: bungalow.location,
    noOfRooms: bungalow.noOfRooms,
    department: bungalow.department,
    price: startingPrice,
    image: bungalow.image,
    description: bungalow.description,
    rating: bungalow.rating,
    amenities: bungalow.amenities,
    highlights: bungalow.highlights,
    capacity: bungalow.capacity,
    caretaker: bungalow.caretaker,
    rooms: bungalow.rooms.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      roomType: r.roomType,
      items: r.items,
      noOfBeds: r.noOfBeds,
      bed_count: r.bed_count ?? undefined,
      capacity: r.capacity ?? undefined,
      price: r.price
    })),
    bookings: bungalow.bookings.map(bk => ({
      id: bk.id,
      roomId: bk.roomId,
      fromDate: bk.fromDate.toISOString(),
      toDate: bk.toDate.toISOString(),
      status: bk.status
    }))
  };

  return <BungalowDetailClient bungalow={formattedBungalow} />;
}
