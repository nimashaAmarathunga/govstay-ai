"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Paperclip, Map, ShieldCheck, 
  CalendarDays, Bell, CheckCircle2, 
  FileText, Sparkles, Search, MessageSquare, Loader2, Info, MapPin, ArrowRight
} from "lucide-react";

interface PropertyCard {
  title: string;
  suite: string;
  price: string;
  image: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  agent?: string;
  text: string;
  timestamp: string;
  propertyCard?: PropertyCard;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<"draft" | "confirming" | "confirmed">("draft");
  
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>("travel_agent");
  const [uiState, setUiState] = useState({ emp_id: "", room_number: "", from_date: "", to_date: "" });

  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1] || base64;
      setAttachment(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string, simulateAttachment: boolean = false) => {
    const text = textToSend !== undefined ? textToSend.trim() : inputText.trim();
    if (!text && !attachment && !simulateAttachment) return;

    if (textToSend === undefined) {
      setInputText("");
    }
    
    const currentAttachment = simulateAttachment ? "simulated_base64_data" : attachment;
    if (!simulateAttachment) {
      setAttachment(null);
    }

    const time = formatTime();
    const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const aiMsgId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: simulateAttachment ? `[Payment Slip Uploaded]\n${text}` : currentAttachment ? `[Attachment Uploaded]\n${text}` : text,
        timestamp: time,
      },
    ]);
    
    setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: "",
          timestamp: time,
        },
    ]);

    try {
        const systemContext = isBookingMode 
          ? `\n\n(System Context - Current Form State: ${JSON.stringify(uiState)})`
          : "";
          
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: text + systemContext, 
                session_id: "demo-session-govstay",
                attachments: currentAttachment ? [{ content_type: "image/png", data: currentAttachment }] : []
            })
        });

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkStr = decoder.decode(value, { stream: true });
            const lines = chunkStr.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.delta?.toLowerCase().includes("pending (awaiting approval)")) {
                          setBookingStatus("confirming");
                        }
                        if (data.delta?.toLowerCase().includes("confirmed")) {
                          setBookingStatus("confirmed");
                        }
                        if (data.agent === "booking_agent" || data.delta?.toLowerCase().includes("booking")) {
                          setIsBookingMode(true);
                        }
                        if (data.ui_state) {
                          setUiState(prev => ({ ...prev, ...data.ui_state }));
                        }
                        if (data.agent) {
                          setActiveAgent(data.agent);
                        }
                        
                        setMessages((prev) => 
                            prev.map(m => {
                                if (m.id !== aiMsgId) return m;
                                let updatedText = m.text + (data.delta || "");
                                const validAgents = ["travel_agent", "booking_agent", "verification_agent", "notification_agent"];
                                validAgents.forEach(ag => {
                                    if (updatedText.toLowerCase().startsWith(ag)) {
                                        updatedText = updatedText.substring(ag.length).trimStart();
                                    }
                                });
                                return {
                                    ...m,
                                    text: updatedText,
                                    agent: data.agent || m.agent
                                };
                            })
                        );
                    } catch (e) {
                        setMessages((prev) => 
                            prev.map(m => m.id === aiMsgId ? {
                                ...m,
                                text: m.text + line.slice(6)
                            } : m)
                        );
                    }
                }
            }
        }
    } catch (err) {
        console.error("Chat error", err);
    }
  };

  const triggerConfirmBooking = () => {
    if (bookingStatus !== "draft") return;
    setBookingStatus("confirming");
    handleSendMessage("I have reviewed the details and submitted the form. Here is my payment slip. Please finalize the booking.", true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const agentIcons: Record<string, React.ReactNode> = {
    verification_agent: <ShieldCheck className="w-4 h-4" />,
    travel_agent: <Map className="w-4 h-4" />,
    booking_agent: <CalendarDays className="w-4 h-4" />,
    notification_agent: <Bell className="w-4 h-4" />,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-[#FDFDFD]">
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Agent Status */}
        <aside className="w-[280px] bg-[#FDFDFD] border-r border-slate-100 flex-col min-h-0 hidden lg:flex">
           <div className="p-6 pb-2">
             <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">System Agents</h2>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              
              {[
                { id: "verification_agent", name: "Verification" },
                { id: "travel_agent", name: "Travel & Discovery" },
                { id: "booking_agent", name: "Booking" },
                { id: "notification_agent", name: "Notifications" }
              ].map(agent => (
                <div 
                  key={agent.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                    activeAgent === agent.id 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-500/20' 
                      : 'bg-transparent border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                      activeAgent === agent.id ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {agentIcons[agent.id]}
                    </div>
                    <div>
                      <h3 className={`text-[13px] font-bold transition-colors ${
                        activeAgent === agent.id ? 'text-emerald-900' : 'text-slate-600'
                      }`}>
                        {agent.name}
                      </h3>
                      <p className={`text-[11px] font-semibold mt-0.5 ${
                        activeAgent === agent.id ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {activeAgent === agent.id ? '● Active Now' : 'Standby'}
                      </p>
                    </div>
                  </div>
                  {activeAgent === agent.id && (
                    <motion.div 
                      layoutId="active-agent"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              ))}
           </div>
        </aside>

        {/* Center Column: Chat Interface */}
        <section className="flex-1 flex flex-col min-h-0 bg-[#FDFDFD] relative">
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-70 mt-32">
                   <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                     <Sparkles className="w-8 h-8 text-slate-900" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-900 mb-2">How can I help you today?</h2>
                   <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                     I can help you search for circuit bungalows, check availability, or manage your bookings.
                   </p>
                </div>
              )}

             {messages.map((message) => {
               const isUser = message.sender === "user";

               if (isUser) {
                 return (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     key={message.id} 
                     className="flex flex-col items-end gap-1.5"
                   >
                     <div className="max-w-[85%] md:max-w-2xl bg-slate-900 text-white px-6 py-4 rounded-[24px] rounded-tr-[8px] shadow-[0_4px_14px_0_rgb(0,0,0,0.05)]">
                       <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                     </div>
                   </motion.div>
                 );
               }

               return (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={message.id} 
                   className="flex flex-col items-start gap-1.5"
                 >
                   {message.agent && (
                     <div className="flex items-center gap-2 ml-4 mb-1">
                       <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                         {message.agent.toLowerCase().includes("verification") ? <ShieldCheck className="w-3 h-3 text-slate-600" /> : 
                          message.agent.toLowerCase().includes("document") ? <FileText className="w-3 h-3 text-slate-600" /> : 
                          message.agent.toLowerCase().includes("booking") ? <CalendarDays className="w-3 h-3 text-slate-600" /> : 
                          <Map className="w-3 h-3 text-slate-600" />}
                       </div>
                       <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                         {message.agent.replace(/\[|\]/g, "").trim().replace("_", " ")}
                       </span>
                     </div>
                   )}
                   <div className="max-w-[85%] md:max-w-2xl bg-white border border-slate-100 px-6 py-4 rounded-[24px] rounded-tl-[8px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-slate-800">
                     {message.text ? (
                       <div className="text-[15px] leading-loose whitespace-pre-wrap font-medium text-slate-700">
                         {message.text.split('\n').map((line, i) => {
                           // Simple markdown bold parsing for better looks
                           if (line.includes('**')) {
                             const parts = line.split('**');
                             return (
                               <p key={i} className="mb-2">
                                 {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 font-bold">{part}</strong> : part)}
                               </p>
                             )
                           }
                           return <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
                         })}
                       </div>
                     ) : (
                       <div className="flex gap-1.5 items-center h-6 px-2">
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                       </div>
                     )}

                     {message.propertyCard && (
                       <div className="mt-6 rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-white group cursor-pointer hover:shadow-md transition-all duration-300">
                         <div className="h-48 w-full overflow-hidden relative">
                           <img
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                             alt={message.propertyCard.title}
                             src={message.propertyCard.image}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                           <div className="absolute bottom-4 left-5 text-white">
                              <h4 className="font-bold text-xl leading-tight mb-1">{message.propertyCard.title}</h4>
                              <p className="text-[13px] text-white/90 font-medium flex items-center gap-1.5">
                                 <MapPin className="w-3.5 h-3.5" />
                                 Nuwara Eliya
                              </p>
                           </div>
                         </div>
                         <div className="p-5 flex justify-between items-center bg-white">
                           <div>
                             <p className="text-[15px] font-semibold text-slate-900">{message.propertyCard.suite}</p>
                           </div>
                           <div className="text-right">
                             <span className="text-slate-900 font-bold text-xl">{message.propertyCard.price}</span>
                             <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">per night</p>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </motion.div>
               );
             })}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 md:p-8 shrink-0">
             <div className="max-w-3xl mx-auto">
               <div className="flex gap-2 mb-4 px-1 overflow-x-auto no-scrollbar">
                 <button onClick={() => handleSendMessage("Tell me more about the amenities")} className="shrink-0 text-[13px] font-medium text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-200 transition-colors flex items-center gap-2 shadow-sm">
                   <Sparkles className="w-3.5 h-3.5" />
                   Amenities
                 </button>
                 <button onClick={() => handleSendMessage("What bungalows are available in Nuwara Eliya?")} className="shrink-0 text-[13px] font-medium text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-200 transition-colors flex items-center gap-2 shadow-sm">
                   <Search className="w-3.5 h-3.5" />
                   Search bungalows
                 </button>
               </div>
               
               <div className="relative flex items-center bg-white border border-slate-200 rounded-3xl p-2 shadow-[0_2px_20px_rgb(0,0,0,0.03)] focus-within:ring-4 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
                 <button 
                   onClick={() => fileInputRef.current?.click()} 
                   className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                     attachment ? 'text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                   }`}
                 >
                    <Paperclip className="w-5 h-5" />
                 </button>
                 <input
                   className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-slate-800 placeholder-slate-400 px-3 py-4"
                   placeholder="Type your message..."
                   type="text"
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={handleKeyPress}
                 />
                 <button
                   onClick={() => handleSendMessage()}
                   disabled={(!inputText.trim() && !attachment)}
                   className="w-12 h-12 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors shadow-sm ml-2"
                 >
                   <ArrowRight className="w-5 h-5" />
                 </button>
               </div>
             </div>
          </div>
        </section>

        {/* Right Column: Dynamic Booking Form */}
        <AnimatePresence>
          {isBookingMode && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="bg-white border-l border-slate-100 flex flex-col min-h-0 shadow-[-10px_0_30px_rgb(0,0,0,0.02)]"
          >
             <div className="p-6 pb-4 flex items-center gap-3 border-b border-slate-50">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                 <FileText className="w-4 h-4 text-slate-700" />
               </div>
               <h2 className="text-[14px] font-bold text-slate-900">Booking Summary</h2>
             </div>
             
             <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</label>
                   <input 
                     type="text" 
                     value={uiState.emp_id || ""} 
                     onChange={e => setUiState({...uiState, emp_id: e.target.value})}
                     className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                     placeholder="e.g. EMP-123"
                   />
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Room</label>
                   <input 
                     type="text" 
                     value={uiState.room_number || ""} 
                     onChange={e => setUiState({...uiState, room_number: e.target.value})}
                     className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                     placeholder="e.g. OLD-101"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Check-in</label>
                     <input 
                       type="date" 
                       value={uiState.from_date || ""} 
                       onChange={e => setUiState({...uiState, from_date: e.target.value})}
                       className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-slate-300 outline-none transition-all"
                     />
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Check-out</label>
                     <input 
                       type="date" 
                       value={uiState.to_date || ""} 
                       onChange={e => setUiState({...uiState, to_date: e.target.value})}
                       className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-slate-300 outline-none transition-all"
                     />
                  </div>
                </div>

                {/* Action / Checkout Card */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl mt-auto flex flex-col gap-5">
                   
                   <div className="flex justify-between items-center pb-5 border-b border-white/10">
                      <span className="text-white/60 text-[13px] font-medium">Status</span>
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${
                        bookingStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 
                        bookingStatus === 'confirming' ? 'bg-amber-500/20 text-amber-400' : 
                        'bg-white/10 text-white'
                      }`}>
                         {bookingStatus}
                      </span>
                   </div>

                   <div className="flex items-center justify-between">
                     <label className="text-[13px] font-medium text-white/90 cursor-pointer flex items-center gap-2" htmlFor="whatsapp-toggle">
                       <MessageSquare className="w-4 h-4 text-emerald-400" />
                       WhatsApp Updates
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
                       <div className="w-full h-full bg-white/20 rounded-full peer peer-checked:bg-emerald-500 transition-colors cursor-pointer"></div>
                       <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 cursor-pointer shadow-sm"></div>
                     </div>
                   </div>

                   {bookingStatus === "draft" ? (
                     <button
                       onClick={triggerConfirmBooking}
                       className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                     >
                       Confirm & Pay
                     </button>
                   ) : bookingStatus === "confirming" ? (
                     <button
                       disabled
                       className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                     >
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Processing
                     </button>
                   ) : (
                     <button
                       disabled
                       className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-md mt-2 flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 className="w-5 h-5" />
                       Confirmed
                     </button>
                   )}
                </div>
             </div>
          </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}