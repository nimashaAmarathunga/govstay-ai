import Link from "next/link";
import { notFound } from "next/navigation";
import { BUNGALOWS, getBungalowBySlug } from "@/lib/bungalows";

type BungalowDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BUNGALOWS.map((bungalow) => ({ slug: bungalow.slug }));
}

export default async function BungalowDetailsPage({ params }: BungalowDetailsPageProps) {
  const { slug } = await params;
  const bungalow = getBungalowBySlug(slug);

  if (!bungalow) {
    notFound();
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 md:px-8 md:py-10">
        <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to browse
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-64 sm:h-80 lg:h-[26rem]">
            <img src={bungalow.image} alt={bungalow.title} className="h-full w-full object-cover" />
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
              <span className="text-sm font-bold text-slate-700">{bungalow.rating}</span>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{bungalow.propertyType}</p>
              <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">{bungalow.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-slate-500">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                {bungalow.location}
              </p>

              <p className="mt-8 max-w-3xl text-base leading-7 text-slate-600">{bungalow.description}</p>

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

            <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600">{bungalow.price}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">/ night</span>
              </div>

              <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                <div className="flex items-center justify-between py-4 text-sm">
                  <span className="text-slate-500">Guests</span>
                  <span className="font-semibold text-slate-700">{bungalow.capacity}</span>
                </div>
                <div className="flex items-center justify-between py-4 text-sm">
                  <span className="text-slate-500">Rooms</span>
                  <span className="font-semibold text-slate-700">{bungalow.rooms}</span>
                </div>
                <div className="flex items-center justify-between py-4 text-sm">
                  <span className="text-slate-500">Check-in</span>
                  <span className="font-semibold text-slate-700">{bungalow.checkIn}</span>
                </div>
              </div>

              <Link href="/bookings" className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700">
                Check availability
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
