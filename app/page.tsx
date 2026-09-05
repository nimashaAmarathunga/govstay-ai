import Link from "next/link";
import Image from "next/image";
import { Search, Map, CalendarCheck, ShieldCheck, FileText, ArrowRight, MapPin, Building2, User, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-palette-5 border-b border-[#21263A] overflow-hidden py-24 text-white">
        <div className="absolute inset-0 bg-radial from-[#157954]/40 to-[#21263A] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
            Discover and Reserve <br className="hidden md:block" />
            <span className="text-[#D0D34D]">Government Bungalows</span>
          </h1>
          <p className="text-lg text-[#C7CEE8] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            GovSewana is the central platform for eligible public servants and citizens to explore, verify, and book circuit bungalows and holiday resorts across Sri Lanka.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className="w-full sm:w-auto px-8 py-4 bg-[#D0D34D] hover:bg-[#b8bb3d] text-[#21263A] font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-[#21263A]" />
              <span>Explore Bungalows</span>
            </Link>
            <Link
              href="/map"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-[#C7CEE8]/40 font-bold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Map className="w-5 h-5 text-[#D0D34D]" />
              <span>View Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#21263A] mb-4">How It Works</h2>
            <p className="text-[#21263A]/70 max-w-2xl mx-auto font-medium">A seamless, fully digitized process from discovering your destination to confirming your reservation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-[#157954]/30 -z-10" />

            {[
              { icon: Search, title: "1. Explore", desc: "Browse available bungalows, locations, and amenities." },
              { icon: Building2, title: "2. Choose", desc: "Select a bungalow, view rooms, and check availability." },
              { icon: User, title: "3. Login", desc: "Sign in with your credentials to initiate a booking." },
              { icon: CalendarCheck, title: "4. Book", desc: "Select dates, upload payment, and await verification." }
            ].map((step, idx) => (
              <div key={idx} className="bg-gradient-card-dark rounded-2xl p-6 border border-[#157954]/40 shadow-md text-center relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#D0D34D] text-[#21263A] rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <step.icon className="w-8 h-8 text-[#21263A]" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#C7CEE8] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#21263A] mb-4">Platform Features</h2>
            <p className="text-[#21263A]/70 max-w-2xl mx-auto font-medium">Everything you need to manage government accommodation in one unified system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Browse Bungalows", desc: "Search through a complete directory of government accommodations with rich details.", icon: Search },
              { title: "Interactive Map", desc: "Discover bungalows across Sri Lanka visually using the interactive map view.", icon: MapPin },
              { title: "GovSewana Support", desc: "Chat with our intelligent Smart Support to find recommendations and check availability.", icon: Sparkles },
              { title: "Online Booking", desc: "Reserve rooms or entire bungalows directly through the streamlined digital flow.", icon: CalendarCheck },
              { title: "Secure Verification", desc: "Upload payment slips and identification documents securely for official verification.", icon: ShieldCheck },
              { title: "Manage Bookings", desc: "Track the status of your reservations and view your complete booking history.", icon: FileText }
            ].map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-card-dark border border-[#157954]/40 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D0D34D] flex items-center justify-center mb-4 shadow-sm">
                  <feat.icon className="w-5 h-5 text-[#21263A]" />
                </div>
                <h3 className="font-extrabold text-white text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-[#C7CEE8] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-palette-5 text-center px-6 text-white relative">
        <h2 className="text-3xl font-extrabold text-white mb-6">Ready to plan your stay?</h2>
        <p className="text-[#C7CEE8] max-w-xl mx-auto mb-10 font-medium text-lg">
          Start exploring our directory of government bungalows and find the perfect accommodation for your next trip.
        </p>
        <Link
          href="/browse"
          className="inline-flex px-8 py-4 bg-[#D0D34D] hover:bg-[#b8bb3d] text-[#21263A] font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all items-center justify-center gap-2"
        >
          <span>Explore Available Bungalows</span>
          <ArrowRight className="w-5 h-5 text-[#21263A]" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#21263A] text-center border-t border-[#157954]/30">
        <p className="text-sm text-[#C7CEE8]/80 font-medium">
          &copy; {new Date().getFullYear()} GovSewana Platform. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
