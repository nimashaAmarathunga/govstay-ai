import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BungalowDetailClient, { DbBungalowDetails } from "./BungalowDetailClient";

type BungalowDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const bungalows = await prisma.circuitBungalow.findMany({
    select: { slug: true },
  });
  return bungalows.map((bungalow) => ({ slug: bungalow.slug }));
}

export default async function BungalowDetailsPage({ params }: BungalowDetailsPageProps) {
  const { slug } = await params;

  const bungalow = await prisma.circuitBungalow.findUnique({
    where: { slug },
    include: {
      rooms: {
        orderBy: { roomNumber: 'asc' }
      },
      caretaker: true
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
      price: r.price
    }))
  };

  return <BungalowDetailClient bungalow={formattedBungalow} />;
}
