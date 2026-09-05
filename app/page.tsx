import Link from "next/link";
import Image from "next/image";
import { Search, Map, CalendarCheck, ShieldCheck, FileText, ArrowRight, MapPin, Building2, User, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-brand-primary border-b border-brand-primary overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary opacity-90 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-32 relative z-10 text-center">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Official Government Portal
          </div> */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Discover and Reserve <br className="hidden md:block" />
            <span className="text-brand-accent">Government Bungalows</span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            GovSewana is the central platform for eligible public servants and citizens to explore, verify, and book circuit bungalows and holiday resorts across Sri Lanka.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className="w-full sm:w-auto px-8 py-4 bg-brand-accent hover:bg-[#5a8640] text-white font-bold rounded-md shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Explore Bungalows</span>
            </Link>
            <Link
              href="/map"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-md transition-all flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5 text-white" />
              <span>View Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">A seamless, fully digitized process from discovering your destination to confirming your reservation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-slate-200/60 -z-10" />

            {[
              { icon: Search, title: "1. Explore", desc: "Browse available bungalows, locations, and amenities." },
              { icon: Building2, title: "2. Choose", desc: "Select a bungalow, view rooms, and check availability." },
              { icon: User, title: "3. Login", desc: "Sign in with your credentials to initiate a booking." },
              { icon: CalendarCheck, title: "4. Book", desc: "Select dates, upload payment, and await verification." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white rounded-md p-6 border border-slate-200 shadow-sm text-center relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 text-brand-primary rounded-md flex items-center justify-center mb-6 border border-slate-200">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Platform Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to manage government accommodation in one unified system.</p>
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
              <div key={idx} className="p-6 rounded-md bg-white border border-slate-200 hover:border-brand-primary transition-colors shadow-sm">
                <feat.icon className="w-6 h-6 text-slate-700 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-primary text-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to plan your stay?</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-10">
          Start exploring our directory of government bungalows and find the perfect accommodation for your next trip.
        </p>
        <Link
          href="/browse"
          className="inline-flex px-8 py-4 bg-brand-accent hover:bg-[#5a8640] text-white font-bold rounded-md shadow-sm transition-all items-center justify-center gap-2"
        >
          <span>Explore Available Bungalows</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 bg-slate-950 text-center border-t border-slate-800">
        <p className="text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} GovSewana Platform. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
