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
      rooms: true,
      caretaker: true,
    },
  });

  if (!bungalow) {
    notFound();
  }

  const bungalowDetails: DbBungalowDetails = {
    id: bungalow.id,
    slug: bungalow.slug,
    name: bungalow.name,
    location: bungalow.location,
    noOfRooms: bungalow.noOfRooms,
    department: bungalow.department,
    price: bungalow.price,
    image: bungalow.image,
    description: bungalow.description,
    rating: bungalow.rating,
    amenities: bungalow.amenities,
    highlights: bungalow.highlights,
    capacity: bungalow.capacity,
    caretaker: bungalow.caretaker
      ? {
          id: bungalow.caretaker.id,
          name: bungalow.caretaker.name,
          address: bungalow.caretaker.address,
          telephoneNo: bungalow.caretaker.telephoneNo,
          emailAddress: bungalow.caretaker.emailAddress,
        }
      : null,
    rooms: bungalow.rooms.map((r) => ({
      id: r.id,
      roomNumber: r.roomNumber,
      roomType: r.roomType as "AC" | "NON_AC",
      items: r.items,
      noOfBeds: r.noOfBeds,
    })),
  };

  return <BungalowDetailClient bungalow={bungalowDetails} />;
}
