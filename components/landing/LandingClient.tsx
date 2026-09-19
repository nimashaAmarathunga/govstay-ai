"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Map, CalendarCheck, ShieldCheck, ArrowRight, MapPin, Building2, Leaf, CheckCircle2, Calendar, Shield, User, Sparkles, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingClient() {
  const images = [
    "https://landcom.gov.lk/assets/images/circuit_bungalow/nuwara-eliya/2.jpg", 
    "https://www.landdevelopment.lk/wp-content/uploads/2022/12/B7-1024x683.jpg",
    "https://landcom.gov.lk/assets/images/circuit_bungalow/nuwara-eliya/1.jpg"
  ];

  return (
    <main className="flex-1 overflow-x-hidden bg-[#F8F9FA]">
      {/* Hero Section with Spotlight/Gradient */}
      <section className="relative bg-[#182624] pt-24 pb-48 text-white z-10 overflow-hidden">
        {/* Spotlight / Radial Gradient Effect to match screenshot */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#295141_0%,_#182624_100%)] pointer-events-none" />

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 pointer-events-none flex items-center justify-center">
          <div className="absolute top-40 right-20 w-96 h-96 rounded-full border border-white/20 border-dashed animate-spin-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm"
            >
              <Leaf className="w-4 h-4 text-[#D0D34D]" />
              <span className="text-xs font-semibold tracking-wide">Sri Lanka Government Circuit Bungalow Portal</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1] drop-shadow-lg"
            >
              Discover and Reserve <br />
              <span className="text-[#D0D34D]">Government Bungalows</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[#C7CEE8] max-w-xl mb-10 leading-relaxed font-medium"
            >
              GovSewana is the central platform for eligible public servants and citizens to explore, verify, and book circuit bungalows and holiday resorts across Sri Lanka.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-12"
            >
              <Link
                href="/browse"
                className="w-full sm:w-auto px-8 py-4 bg-[#D0D34D] hover:bg-[#b8bb3d] text-[#0F382E] font-extrabold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5 text-[#0F382E]" />
                <span>Explore Bungalows</span>
                <ArrowRight className="w-4 h-4 ml-1 text-[#0F382E]" />
              </Link>
              <Link
                href="/map"
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold rounded-full transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Map className="w-5 h-5 text-[#D0D34D]" />
                <span>View Map</span>
              </Link>
            </motion.div>

            {/* Mini Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white/50" />
                <span className="text-sm font-medium text-white/80">Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white/50" />
                <span className="text-sm font-medium text-white/80">Easy Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-white/50" />
                <span className="text-sm font-medium text-white/80">Explore Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-white/50" />
                <span className="text-sm font-medium text-white/80">Secure & Reliable</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Polaroid Images */}
          <div className="lg:w-1/2 relative h-[500px] w-full mt-12 lg:mt-0 hidden md:block">
            {/* Back-most layer */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: -10 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute top-10 left-10 z-10 bg-white p-2 rounded-lg shadow-xl"
              style={{ width: "240px", height: "160px" }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-md bg-slate-200">
                <img src={images[0]} alt="Circuit Bungalow" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Middle layer */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
              animate={{ opacity: 1, scale: 1, rotate: 8 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute bottom-10 right-0 z-20 bg-white p-2 rounded-lg shadow-2xl"
              style={{ width: "280px", height: "180px" }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-md bg-slate-200">
                <img src={images[1]} alt="Rest House" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Front-most layer */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute top-32 left-32 z-30 bg-white p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              style={{ width: "360px", height: "240px" }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg bg-slate-200">
                <img src={images[2]} alt="Government Bungalow" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute -bottom-10 right-10 z-40 transform rotate-[-5deg]"
            >

            </motion.div>
          </div>
        </div>

        {/* Wavy Bottom Border */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[60px] md:h-[120px]" preserveAspectRatio="none">
            <path d="M0,60 C320,120 420,0 720,60 C1020,120 1120,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="relative z-20 -mt-20 max-w-7xl mx-auto px-6 mb-16 bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Government Bungalows", desc: "Comfortable stays in scenic locations across Sri Lanka.", icon: Building2 },
            { title: "Interactive Map", desc: "Find bungalows and resorts near your destination.", icon: MapPin },
            { title: "Online Booking", desc: "Book your stay quickly and securely.", icon: CalendarCheck },
            { title: "For Eligible Users", desc: "Available for public servants and authorized citizens.", icon: ShieldCheck }
          ].map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col items-start hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                <item.icon className="w-7 h-7 text-emerald-700" />
              </div>
              <h3 className="text-base font-extrabold text-[#21263A] mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#21263A] mb-4">How It Works</h2>
            <p className="text-[#21263A]/70 max-w-2xl mx-auto font-medium">A seamless, fully digitized process from discovering your destination to confirming your reservation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-emerald-100 -z-10" />

            {[
              { icon: Search, title: "1. Explore", desc: "Browse available bungalows, locations, and amenities." },
              { icon: Building2, title: "2. Choose", desc: "Select a bungalow, view rooms, and check availability." },
              { icon: User, title: "3. Login", desc: "Sign in with your credentials to initiate a booking." },
              { icon: CalendarCheck, title: "4. Book", desc: "Select dates, upload payment, and await verification." }
            ].map((step, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={idx}
                className="bg-gradient-to-br from-[#0F382E] to-[#157954] rounded-2xl p-6 shadow-lg text-center relative z-10 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-16 h-16 bg-[#D0D34D] text-[#0F382E] rounded-xl flex items-center justify-center mb-6 shadow-md transform rotate-3">
                  <step.icon className="w-8 h-8 text-[#0F382E] -rotate-3" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#C7CEE8] leading-relaxed">{step.desc}</p>
              </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative z-10 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-slate-50 text-[#0F382E] rounded-full flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-emerald-50 transition-colors">
                  <feat.icon className="w-8 h-8 text-[#157954]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#21263A] mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#182624] text-center px-6 border-t border-white/10 relative overflow-hidden">
        {/* Spotlight Effect for CTA */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#295141_0%,_#182624_100%)] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-6 drop-shadow-md">Ready to plan your stay?</h2>
          <p className="text-[#C7CEE8] max-w-xl mx-auto mb-10 font-medium text-lg">
            Start exploring our directory of government bungalows and find the perfect accommodation for your next trip.
          </p>
          <Link
            href="/browse"
            className="inline-flex px-8 py-4 bg-[#D0D34D] hover:bg-[#b8bb3d] text-[#0F382E] font-extrabold rounded-full shadow-lg hover:shadow-xl transition-all items-center justify-center gap-2"
          >
            <span>Explore Available Bungalows</span>
            <ArrowRight className="w-5 h-5 text-[#0F382E]" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0a251e] text-center border-t border-white/10">
        <p className="text-sm text-white/50 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} GovSewana Platform. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
