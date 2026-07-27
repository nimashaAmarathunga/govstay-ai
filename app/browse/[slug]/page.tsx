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
      }
    }
  });

  if (!bungalow) {
    notFound();
  }

  const startingPrice = bungalow.rooms.length > 0 
    ? Math.min(...bungalow.rooms.map(r => r.price))
    : 0;
  
  const formattedPrice = `Rs. ${startingPrice.toLocaleString()}`;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8 md:py-10">
        <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to browse
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-64 sm:h-80 lg:h-[26rem]">
            <img src={bungalow.image} alt={bungalow.name} className="h-full w-full object-cover" />
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
              <span className="text-sm font-bold text-slate-700">{bungalow.rating}</span>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{bungalow.department}</p>
              <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">{bungalow.name}</h1>
              
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <p className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  {bungalow.location}
                </p>
                {bungalow.gmapLink && (
                  <a href={bungalow.gmapLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    View on Google Maps
                  </a>
                )}
              </div>

              <p className="mt-8 max-w-3xl text-base leading-7 text-slate-600">{bungalow.description}</p>

              {/* Room Pricing List */}
              <section className="mt-8 border-t border-slate-100 pt-7">
                <h2 className="text-xl font-bold text-slate-800">Available Rooms</h2>
                <div className="mt-4 flex flex-col gap-4">
                  {bungalow.rooms.map((room) => (
                    <div key={room.id} className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="mb-3 md:mb-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-800 text-lg">Room {room.roomNumber}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${room.roomType === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {room.roomType === 'AC' ? 'A/C' : 'Non A/C'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                          <span className="material-symbols-outlined text-[16px]">bed</span>
                          {room.noOfBeds} Beds • Up to {room.noOfBeds * 2} guests
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {room.items.map(item => (
                            <span key={item} className="text-xs bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-end justify-between md:flex-col md:items-end gap-2">
                        <div className="text-right">
                          <span className="block text-xs text-slate-500 font-medium">Price per night</span>
                          <span className="text-xl font-bold text-blue-600">Rs. {room.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-8 border-t border-slate-100 pt-7">
                <h2 className="text-xl font-bold text-slate-800">What makes this stay special</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {bungalow.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-600">
                      <span className="material-symbols-outlined text-[20px] text-blue-600">check_circle</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-8 border-t border-slate-100 pt-7">
                <h2 className="text-xl font-bold text-slate-800">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {bungalow.amenities.map((amenity) => (
                    <span key={amenity} className="rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">{amenity}</span>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5 sticky top-6">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500 font-medium mr-1">Rooms from</span>
                <span className="text-2xl font-bold text-blue-600">{formattedPrice}</span>
              </div>

              <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                <div className="flex items-center justify-between py-4 text-sm">
                  <span className="text-slate-500">Total Rooms</span>
                  <span className="font-semibold text-slate-700">{bungalow.noOfRooms} rooms</span>
                </div>
                <div className="flex items-center justify-between py-4 text-sm">
                  <span className="text-slate-500">Check-in</span>
                  <span className="font-semibold text-slate-700">From 2:00 PM</span>
                </div>
              </div>

              <Link href="/bookings" className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700">
                Book a Room
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">Availability is confirmed during the booking process.</p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
