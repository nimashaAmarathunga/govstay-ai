"use client";

import React, { useState, useEffect, useRef } from "react";

interface PropertyCard {
  title: string;
  suite: string;
  price: string;
  image: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  agent?: "Verification Agent" | "Preference Agent" | "Booking Agent" | "Notification Agent";
  text: string;
  timestamp: string;
  propertyCard?: PropertyCard;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      text: "Find me a quiet bungalow in Nuwara Eliya for next weekend.",
      timestamp: "10:42 AM",
    },
    {
      id: "2",
      sender: "ai",
      agent: "Verification Agent",
      text: "Identity verified. Accessing government residencies...",
      timestamp: "10:42 AM",
    },
    {
      id: "3",
      sender: "ai",
      agent: "Preference Agent",
      text: "Based on your preference for garden views, I've found the Nuwara Eliya Rest House. It offers a secluded setting with colonial architecture and extensive landscaped grounds.",
      timestamp: "10:43 AM",
      propertyCard: {
        title: "Nuwara Eliya Rest House",
        suite: "Superior Garden Suite",
        price: "Rs. 18,500",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHtjFwAj-lsUvWvMM4b5izQJgtLPrniT_NaZ-YiGrw33YJ8RniIPjmTjSUw8FYJuKsHIvNV-bCVhSpjQmZXftPv6MvjkVYu--XWXSnEEOrYKb8kSgvMlvP9n0aFegBq7P46C_SlEcyZhVnfmyJVGXybDENXRBVKIL-4GFglCZGhqGfITPMZQGP9OXoJAFn19ilHm-WduLmEUl3IEbSe6lBKWeRfdJXvKUpJKf1nAQ1PoM31nZXCwnJ",
      },
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<"draft" | "confirming" | "confirmed">("draft");
  const [systemLoad, setSystemLoad] = useState(12);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Subtle updates to system load to look live
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const nextLoad = prev + change;
        return Math.max(8, Math.min(18, nextLoad));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend.trim() : inputText.trim();
    if (!text) return;

    if (textToSend === undefined) {
      setInputText("");
    }

    const time = formatTime();

    // 1. Add User Message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text,
        timestamp: time,
      },
    ]);

    // 2. Add AI reply simulation
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let replyText = "";
      let activeAgent: "Verification Agent" | "Preference Agent" | "Booking Agent" | "Notification Agent" = "Preference Agent";

      if (lowerText.includes("amenities") || lowerText.includes("tell me more")) {
        replyText = "The Nuwara Eliya Rest House features a scenic garden veranda, fireplace heating, premium Ceylon tea lounge access, high-speed Wi-Fi, and personalized steward service.";
      } else if (lowerText.includes("other") || lowerText.includes("nearby") || lowerText.includes("bungalow")) {
        replyText = "Other nearby government options: Nuwara Eliya General Bungalow (Rs. 15,000) and Sri Lanka Post Heritage Suite (Rs. 16,500). Let me know if you want me to search them.";
      } else if (lowerText.includes("confirm") || lowerText.includes("book")) {
        triggerConfirmBooking();
        return;
      } else {
        replyText = `I have logged: "${text}". Please confirm the booking using the panel on the right or ask for more details.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          agent: activeAgent,
          text: replyText,
          timestamp: formatTime(),
        },
      ]);
    }, 800);
  };

  const triggerConfirmBooking = () => {
    if (bookingStatus !== "draft") return;

    setBookingStatus("confirming");

    setTimeout(() => {
      setBookingStatus("confirmed");
      const time = formatTime();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          agent: "Booking Agent",
          text: "Booking finalized. Your reservation at Nuwara Eliya Rest House is locked in.",
          timestamp: time,
        },
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          agent: "Notification Agent",
          text: whatsappEnabled
            ? "WhatsApp notification secure link generated and dispatched."
            : "Notification secure receipt generated and dispatched to your email.",
          timestamp: time,
        },
      ]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-inverse-surface shadow-sm select-none">
        <div className="flex items-center gap-8">
          <h1 className="font-headline-md text-headline-md font-bold text-surface-bright">
            GovStay AI
          </h1>
          <nav className="hidden md:flex gap-6 items-center h-full">
            <a
              href="#"
              className="font-label-md text-label-md text-surface-variant hover:text-surface-bright transition-colors"
            >
              Browse
            </a>
            <a
              href="#"
              className="font-label-md text-label-md text-surface-variant hover:text-surface-bright transition-colors"
            >
              Map View
            </a>
            <a
              href="#"
              className="font-label-md text-label-md text-primary-fixed border-b-2 border-primary-fixed pb-1 font-medium"
            >
              Agent Platform
            </a>
            <a
              href="#"
              className="font-label-md text-label-md text-surface-variant hover:text-surface-bright transition-colors"
            >
              My Bookings
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-label-md text-label-md text-surface-variant cursor-pointer hover:text-surface-bright">
            English
          </span>
          <div className="flex gap-2">
            <button className="p-2 text-surface-variant hover:bg-on-surface-variant/10 rounded-full transition-all active:scale-95 cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-surface-variant hover:bg-on-surface-variant/10 rounded-full transition-all active:scale-95 cursor-pointer">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant">
            <img
              className="w-full h-full object-cover"
              alt="Avatar of government official"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGCXl0kYkpoLHHx0G_49GPuQztc4VopnoiFgKFM_wr71bz39PeikWIGXi8W-a3OIJ4dt9TUW1SrWN4xHp3qxcsHuKPihaTSA4dK6Swgq11R36yHsueOmIDeUDvwe9t0Wb67HkoK87Ka9cWAQHU7o9mb_QM0l9HNZ-A_6zkhW72NfAbO19JnNlWwPkn4-OqnsYMzyWehYs3B2dkVC2vskOW2PoqFPtelLviBm35-TgFZYO1RVt3z15f"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* Left Column: Agent Pipeline */}
        <aside className="w-80 border-r border-outline-variant bg-surface-container-low flex flex-col select-none">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
              Agent Pipeline
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Real-time status monitoring
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Verification Agent */}
            <div className="bento-card p-4 bg-surface-container-lowest rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ai-pulse"></span>
                  <span className="font-label-md text-label-md text-on-surface">
                    Verification Agent
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">
                  verified
                </span>
              </div>
              <div className="p-2 bg-surface rounded-lg">
                <p className="font-label-sm text-label-sm text-on-surface-variant italic">
                  Log: "Identity confirmed via Gov-ID"
                </p>
              </div>
            </div>

            {/* Preference Agent */}
            <div className="bento-card p-4 bg-surface-container-lowest rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ai-pulse"></span>
                  <span className="font-label-md text-label-md text-on-surface">
                    Preference Agent
                  </span>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">
                  psychology
                </span>
              </div>
              <div className="p-2 bg-surface rounded-lg">
                <p className="font-label-sm text-label-sm text-on-surface-variant italic">
                  Log: "Analyzing historical booking patterns"
                </p>
              </div>
            </div>

            {/* Booking Agent */}
            <div
              className={`bento-card p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                bookingStatus === "draft"
                  ? "bg-surface-container-low border-outline-variant/50 opacity-70"
                  : "bg-surface-container-lowest border-primary/20 shadow-sm"
              }`}
            >
              {bookingStatus !== "draft" && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      bookingStatus === "confirmed"
                        ? "bg-emerald-500 ai-pulse"
                        : bookingStatus === "confirming"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-outline"
                    }`}
                  ></span>
                  <span className="font-label-md text-label-md text-on-surface">
                    Booking Agent
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    bookingStatus === "draft" ? "text-on-surface-variant" : "text-primary"
                  }`}
                >
                  calendar_today
                </span>
              </div>
              <div className={`p-2 rounded-lg ${bookingStatus === "draft" ? "bg-surface-container" : "bg-surface"}`}>
                <p className="font-label-sm text-label-sm text-on-surface-variant italic">
                  {bookingStatus === "draft"
                    ? 'Log: "Waiting for user confirmation"'
                    : bookingStatus === "confirming"
                    ? 'Log: "Authenticating Gov-Gateway allocation..."'
                    : 'Log: "Booking finalized and token archived"'}
                </p>
              </div>
            </div>

            {/* Notification Agent */}
            <div
              className={`bento-card p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                bookingStatus !== "confirmed"
                  ? "bg-surface-container-low border-outline-variant/50 opacity-70"
                  : "bg-surface-container-lowest border-primary/20 shadow-sm"
              }`}
            >
              {bookingStatus === "confirmed" && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      bookingStatus === "confirmed" ? "bg-emerald-500 ai-pulse" : "bg-outline"
                    }`}
                  ></span>
                  <span className="font-label-md text-label-md text-on-surface">
                    Notification Agent
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    bookingStatus !== "confirmed" ? "text-on-surface-variant" : "text-primary"
                  }`}
                >
                  notifications_active
                </span>
              </div>
              <div className={`p-2 rounded-lg ${bookingStatus !== "confirmed" ? "bg-surface-container" : "bg-surface"}`}>
                <p className="font-label-sm text-label-sm text-on-surface-variant italic">
                  {bookingStatus !== "confirmed"
                    ? 'Log: "Awaiting trigger"'
                    : whatsappEnabled
                    ? 'Log: "WhatsApp secure dispatch confirmed"'
                    : 'Log: "Gov-Email secure dispatch confirmed"'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container border-t border-outline-variant">
            <div className="flex items-center justify-between text-on-surface-variant px-2 font-medium">
              <span className="text-label-sm font-label-sm">System Load</span>
              <span className="text-label-sm font-label-sm">{systemLoad}%</span>
            </div>
            <div className="mt-2 w-full bg-outline-variant rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-500"
                style={{ width: `${systemLoad}%` }}
              ></div>
            </div>
          </div>
        </aside>

        {/* Center Column: Conversational Chat */}
        <section className="flex-1 bg-surface-container-lowest flex flex-col">
          <div className="p-6 border-b border-outline-variant flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  smart_toy
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-[18px] text-on-surface font-semibold">
                  AI Booking Assistant
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    Active Session • Nuwara Eliya Search
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">share</span>
              </button>
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
              </button>
            </div>
          </div>

          {/* Chat Flow */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
          >
            {messages.map((message) => {
              const isUser = message.sender === "user";

              if (isUser) {
                return (
                  <div key={message.id} className="flex flex-col items-end gap-2 animate-fade-in">
                    <div className="max-w-[80%] bg-surface-container-high p-4 rounded-2xl rounded-tr-none text-on-surface">
                      <p className="font-body-md text-body-md whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest px-2 select-none">
                      User • {message.timestamp}
                    </span>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex flex-col items-start gap-2 animate-fade-in">
                  {message.agent && (
                    <div className="flex items-center gap-2 mb-1 select-none">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          {message.agent === "Verification Agent"
                            ? "verified"
                            : message.agent === "Preference Agent"
                            ? "psychology"
                            : message.agent === "Booking Agent"
                            ? "calendar_today"
                            : "notifications_active"}
                        </span>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {message.agent}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="max-w-[80%] bg-white border border-outline-variant p-4 rounded-2xl rounded-tl-none shadow-sm text-on-surface">
                    <p className="font-body-md text-body-md whitespace-pre-wrap">{message.text}</p>

                    {message.propertyCard && (
                      <div className="mt-4 border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
                        <div className="h-32 w-full overflow-hidden bg-slate-100">
                          <img
                            className="w-full h-full object-cover"
                            alt={message.propertyCard.title}
                            src={message.propertyCard.image}
                          />
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                              {message.propertyCard.title}
                            </h4>
                            <p className="text-label-sm text-on-surface-variant">
                              {message.propertyCard.suite}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-primary font-bold">{message.propertyCard.price}</span>
                            <p className="text-[10px] text-on-surface-variant">per night</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest px-2 select-none">
                    GovStay AI • {message.timestamp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-surface-container-low border-t border-outline-variant">
            <div className="relative max-w-3xl mx-auto flex items-center bg-white border border-outline rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <input
                className="flex-1 border-none focus:ring-0 bg-transparent text-body-md px-3 py-2 text-on-surface outline-none"
                placeholder="Type a message or ask the agent to book..."
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="flex justify-center gap-4 mt-3 select-none">
              <button
                onClick={() => handleSendMessage("Tell me more about the amenities")}
                className="text-label-sm font-label-sm text-on-surface-variant border border-outline-variant px-3 py-1 rounded-full hover:bg-white bg-transparent transition-colors cursor-pointer"
              >
                "Tell me more about the amenities"
              </button>
              <button
                onClick={() => handleSendMessage("Any other bungalows nearby?")}
                className="text-label-sm font-label-sm text-on-surface-variant border border-outline-variant px-3 py-1 rounded-full hover:bg-white bg-transparent transition-colors cursor-pointer"
              >
                "Any other bungalows nearby?"
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Session Context & Draft State */}
        <aside className="w-80 border-l border-outline-variant bg-surface-container-low flex flex-col select-none">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
              Session Context
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Real-time Draft State
            </p>
          </div>
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            {/* Context Items */}
            <div className="space-y-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    account_circle
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Verified User ID
                  </span>
                </div>
                <p className="font-headline-md text-[18px] text-on-surface font-mono">
                  STU-2026-001
                </p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    location_on
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Selected Accommodation
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface font-semibold">
                  Nuwara Eliya Rest House
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    event
                  </span>
                  <span className="text-label-sm font-label-sm text-on-surface">
                    Sept 14 - Sept 16, 2024
                  </span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-inverse-surface text-surface-bright p-5 rounded-2xl shadow-xl space-y-4">
              <h3 className="font-label-md text-label-md flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    bookingStatus === "confirmed"
                      ? "bg-emerald-400 ai-pulse"
                      : bookingStatus === "confirming"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-primary-fixed"
                  }`}
                ></span>
                {bookingStatus === "confirmed"
                  ? "Booking Confirmed"
                  : bookingStatus === "confirming"
                  ? "Finalizing..."
                  : "Ready to Finalize"}
              </h3>
              <div className="py-2 border-y border-on-surface-variant/20 space-y-2">
                <div className="flex justify-between text-label-sm">
                  <span className="text-surface-variant">2 Nights × Rs. 18,500</span>
                  <span>Rs. 37,000</span>
                </div>
                <div className="flex justify-between text-label-sm">
                  <span className="text-surface-variant">Service Fee</span>
                  <span>Rs. 1,200</span>
                </div>
                <div className="flex justify-between font-bold text-label-md mt-1">
                  <span>Total</span>
                  <span className="text-primary-fixed">Rs. 38,200</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <label className="text-label-sm text-surface-variant cursor-pointer" htmlFor="whatsapp-toggle">
                  Send WhatsApp notification
                </label>
                <div className="relative inline-block w-10 h-5">
                  <input
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    disabled={bookingStatus !== "draft"}
                    className="sr-only peer disabled:opacity-50"
                    id="whatsapp-toggle"
                    type="checkbox"
                  />
                  <div className="w-full h-full bg-on-surface-variant/30 rounded-full peer peer-checked:bg-primary-fixed transition-colors cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 cursor-pointer"></div>
                </div>
              </div>

              {bookingStatus === "draft" ? (
                <button
                  onClick={triggerConfirmBooking}
                  className="w-full py-3 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer font-bold"
                >
                  Confirm Booking
                </button>
              ) : bookingStatus === "confirming" ? (
                <button
                  disabled
                  className="w-full py-3 bg-primary-container/70 text-on-primary-container font-label-md text-label-md rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-wait"
                >
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  Securing Booking...
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-emerald-600 text-white font-label-md text-label-md rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 select-none cursor-default"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Booking Confirmed
                </button>
              )}
              <p className="text-[10px] text-center text-surface-variant opacity-70">
                Secured via Gov-Gateway Encryption
              </p>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}