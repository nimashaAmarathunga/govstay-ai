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

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
        replyText = `I have noted: "${text}". Feel free to confirm your booking or ask for more details.`;
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
            ? "WhatsApp confirmation sent to your registered number."
            : "Booking confirmation sent to your email.",
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
    <div className="flex flex-col h-full bg-slate-50">
      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Clean Agent Status */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
           <div className="p-5 border-b border-slate-100">
             <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Assistant Agents</h2>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Verification Agent */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 relative">
                 <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-blue-600 text-xl">verified_user</span>
                    <span className="font-semibold text-slate-800 text-sm">Verification</span>
                 </div>
                 <p className="text-xs text-slate-600 ml-8">Identity Confirmed</p>
                 <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>

              {/* Preference Agent */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 relative">
                 <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-blue-600 text-xl">psychology</span>
                    <span className="font-semibold text-slate-800 text-sm">Preferences</span>
                 </div>
                 <p className="text-xs text-slate-600 ml-8">Analyzing Requirements</p>
                 <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>

              {/* Booking Agent */}
              <div className={`p-4 rounded-2xl border transition-all ${bookingStatus !== 'draft' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-70'} relative`}>
                 <div className="flex items-center gap-3 mb-1">
                    <span className={`material-symbols-outlined text-xl ${bookingStatus !== 'draft' ? 'text-blue-600' : 'text-slate-400'}`}>event_available</span>
                    <span className={`font-semibold text-sm ${bookingStatus !== 'draft' ? 'text-slate-800' : 'text-slate-500'}`}>Booking</span>
                 </div>
                 <p className="text-xs text-slate-600 ml-8">
                   {bookingStatus === 'draft' ? 'Awaiting Confirmation' : bookingStatus === 'confirming' ? 'Processing...' : 'Confirmed'}
                 </p>
                 <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${bookingStatus === 'confirmed' ? 'bg-emerald-500' : bookingStatus === 'confirming' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
              </div>

              {/* Notification Agent */}
              <div className={`p-4 rounded-2xl border transition-all ${bookingStatus === 'confirmed' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-70'} relative`}>
                 <div className="flex items-center gap-3 mb-1">
                    <span className={`material-symbols-outlined text-xl ${bookingStatus === 'confirmed' ? 'text-blue-600' : 'text-slate-400'}`}>notifications_active</span>
                    <span className={`font-semibold text-sm ${bookingStatus === 'confirmed' ? 'text-slate-800' : 'text-slate-500'}`}>Notifications</span>
                 </div>
                 <p className="text-xs text-slate-600 ml-8">
                   {bookingStatus === 'confirmed' ? 'Message Sent' : 'Standby'}
                 </p>
                 <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${bookingStatus === 'confirmed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              </div>

           </div>
        </aside>

        {/* Center Column: Chat Interface */}
        <section className="flex-1 flex flex-col bg-slate-50 relative">
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth">
             {messages.map((message) => {
               const isUser = message.sender === "user";

               if (isUser) {
                 return (
                   <div key={message.id} className="flex flex-col items-end gap-1 animate-fade-in">
                     <div className="max-w-[75%] bg-blue-600 text-white px-5 py-3.5 rounded-3xl rounded-tr-sm shadow-sm">
                       <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                     </div>
                     <span className="text-xs text-slate-400 px-2 font-medium">You • {message.timestamp}</span>
                   </div>
                 );
               }

               return (
                 <div key={message.id} className="flex flex-col items-start gap-1 animate-fade-in">
                   {message.agent && (
                     <div className="flex items-center gap-1.5 ml-2 mb-0.5">
                       <span className="material-symbols-outlined text-[14px] text-blue-600">
                           {message.agent === "Verification Agent" ? "verified_user" : 
                            message.agent === "Preference Agent" ? "psychology" : 
                            message.agent === "Booking Agent" ? "event_available" : "notifications_active"}
                       </span>
                       <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                         {message.agent}
                       </span>
                     </div>
                   )}
                   <div className="max-w-[75%] bg-white border border-slate-100 px-5 py-3.5 rounded-3xl rounded-tl-sm shadow-sm text-slate-700">
                     <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>

                     {message.propertyCard && (
                       <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white group cursor-pointer hover:shadow-md transition-shadow">
                         <div className="h-40 w-full overflow-hidden relative">
                           <img
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                             alt={message.propertyCard.title}
                             src={message.propertyCard.image}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                           <div className="absolute bottom-3 left-3 text-white">
                              <h4 className="font-bold text-lg leading-tight">{message.propertyCard.title}</h4>
                              <p className="text-xs text-white/90 font-medium flex items-center gap-1">
                                 <span className="material-symbols-outlined text-[12px]">location_on</span>
                                 Nuwara Eliya
                              </p>
                           </div>
                         </div>
                         <div className="p-4 flex justify-between items-center bg-white">
                           <div>
                             <p className="text-sm font-medium text-slate-800">{message.propertyCard.suite}</p>
                           </div>
                           <div className="text-right">
                             <span className="text-blue-600 font-bold text-lg">{message.propertyCard.price}</span>
                             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">per night</p>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                   <span className="text-xs text-slate-400 px-2 font-medium">GovSewana Assistant • {message.timestamp}</span>
                 </div>
               );
             })}
          </div>

          {/* Chat Input */}
          <div className="p-4 md:p-6 bg-white border-t border-slate-200">
            <div className="max-w-3xl mx-auto">
               <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                  <button onClick={() => handleSendMessage("Tell me more about the amenities")} className="whitespace-nowrap px-4 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium cursor-pointer">
                     ✨ Tell me about amenities
                  </button>
                  <button onClick={() => handleSendMessage("Any other bungalows nearby?")} className="whitespace-nowrap px-4 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium cursor-pointer">
                     🔍 Show alternatives
                  </button>
               </div>
               <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full p-1.5 pr-2 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                 <button className="w-10 h-10 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
                 </button>
                 <input
                   className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-slate-800 placeholder-slate-400 py-2"
                   placeholder="Type your message..."
                   type="text"
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={handleKeyPress}
                 />
                 <button
                   onClick={() => handleSendMessage()}
                   disabled={!inputText.trim()}
                   className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                 >
                   <span className="material-symbols-outlined text-[18px]">send</span>
                 </button>
               </div>
            </div>
          </div>
        </section>

        {/* Right Column: Booking Details */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col">
           <div className="p-5 border-b border-slate-100 flex items-center gap-2">
             <span className="material-symbols-outlined text-slate-400">receipt_long</span>
             <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Your Selection</h2>
           </div>
           
           <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-6">
              
              {/* Selected Accommodation info */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <h3 className="font-bold text-slate-800 text-lg mb-1">Nuwara Eliya Rest House</h3>
                 <p className="text-sm text-slate-500 mb-4">Superior Garden Suite</p>
                 
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                       <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                       <div>
                          <p className="font-medium">Sept 14 - Sept 16</p>
                          <p className="text-xs text-slate-500">2 Nights</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                       <span className="material-symbols-outlined text-slate-400 text-[20px]">group</span>
                       <p className="font-medium">2 Guests</p>
                    </div>
                 </div>
              </div>

              {/* Action / Checkout Card */}
              <div className="bg-slate-800 text-white p-5 rounded-3xl shadow-lg mt-auto flex flex-col gap-4">
                 
                 <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white/70 text-sm">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bookingStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : bookingStatus === 'confirming' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                       {bookingStatus}
                    </span>
                 </div>

                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/80">
                       <span>Rs. 18,500 x 2 nights</span>
                       <span>Rs. 37,000</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                       <span>Service Fee</span>
                       <span>Rs. 1,200</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-white/10">
                       <span>Total</span>
                       <span className="text-emerald-400">Rs. 38,200</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between py-2 mt-2">
                   <label className="text-sm text-white/80 cursor-pointer flex items-center gap-2" htmlFor="whatsapp-toggle">
                     <span className="material-symbols-outlined text-[18px]">chat</span>
                     WhatsApp Updates
                   </label>
                   <div className="relative inline-block w-11 h-6">
                     <input
                       checked={whatsappEnabled}
                       onChange={(e) => setWhatsappEnabled(e.target.checked)}
                       disabled={bookingStatus !== "draft"}
                       className="sr-only peer disabled:opacity-50"
                       id="whatsapp-toggle"
                       type="checkbox"
                     />
                     <div className="w-full h-full bg-white/20 rounded-full peer peer-checked:bg-blue-500 transition-colors cursor-pointer"></div>
                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 cursor-pointer shadow-sm"></div>
                   </div>
                 </div>

                 {bookingStatus === "draft" ? (
                   <button
                     onClick={triggerConfirmBooking}
                     className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                   >
                     Confirm Booking
                     <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                   </button>
                 ) : bookingStatus === "confirming" ? (
                   <button
                     disabled
                     className="w-full py-3.5 bg-blue-500/50 text-white font-bold rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-wait"
                   >
                     <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                     Processing...
                   </button>
                 ) : (
                   <button
                     disabled
                     className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-2xl shadow-md mt-2 flex items-center justify-center gap-2"
                   >
                     <span className="material-symbols-outlined text-[20px]">check_circle</span>
                     Confirmed
                   </button>
                 )}
              </div>
           </div>
        </aside>
      </main>
    </div>
  );
}