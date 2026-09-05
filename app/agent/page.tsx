"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import PaymentSlipUpload from "@/components/booking/PaymentSlipUpload";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/context/UserContext";
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
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [draftState, setDraftState] = useState<{ emp_id: string; room_number: string; from_date: string; to_date: string; total_cost?: number; booking_id?: string; status?: string }>({ emp_id: "", room_number: "", from_date: "", to_date: "" });
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [agentStates, setAgentStates] = useState<Record<string, "STANDBY" | "WORKING" | "COMPLETED" | "ERROR">>({
    verification_agent: "STANDBY",
    travel_agent: "STANDBY",
    booking_agent: "STANDBY",
    notification_agent: "STANDBY",
  });
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [sessionId] = useState(() => `demo-session-${Date.now()}`);
  const router = useRouter();
  
  const { activeUser } = useUser();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeBooking?.status === "CONFIRMED") {
      const timer = setTimeout(() => {
        router.push('/bookings');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [activeBooking?.status, router]);

  const fetchActiveBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data);
      }
    } catch (e) {
      console.error("Failed to fetch active booking", e);
    }
  };

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
          ? `\n\n(System Context - Current Form State: ${JSON.stringify(draftState)})`
          : "";
          
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: text + systemContext, 
                session_id: sessionId,
                user: activeUser ? {
                  id: activeUser.id,
                  name: activeUser.name,
                  email: activeUser.emailAddress,
                  authenticated: true,
                  empId: activeUser.empId
                } : null,
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
                        
                        if (data.agent === "booking_agent" || data.delta?.toLowerCase().includes("booking")) {
                          setIsBookingMode(true);
                        }
                        if (data.ui_state) {
                          setDraftState(prev => ({ ...prev, ...data.ui_state }));
                          if (data.ui_state.booking_id) {
                            fetchActiveBooking(data.ui_state.booking_id);
                          }
                        }
                        if (data.status && data.agent) {
                          setAgentStates(prev => ({ ...prev, [data.agent]: data.status }));
                        }
                        // Also keep activeAgent logic fallback for old styling if needed, or we just rely on status
                        if (data.agent && data.status === "WORKING") {
                          setAgentStates(prev => ({ ...prev, [data.agent]: "WORKING" }));
                        }
                        
                        setMessages((prev) => 
                            prev.map(m => {
                                if (m.id !== aiMsgId) return m;
                                let deltaText = data.error ? `[System Error]: ${data.error}` : (data.delta || "");
                                let updatedText = m.text + deltaText;
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
    if (activeBooking && activeBooking.status === "PENDING" && activeBooking.paymentSlipUrl) return;
    if (!draftState.booking_id && !activeBooking?.bookingId) return;
    if (!paymentSlipUrl) {
      alert("Please upload your payment slip first before verifying.");
      return;
    }
    // Optimistic update
    setActiveBooking((prev: any) => prev ? { ...prev, status: "PENDING", paymentSlipUrl: paymentSlipUrl } : prev);
    handleSendMessage(`I have reviewed the details and submitted the form. Here is my payment slip: ${paymentSlipUrl}. Please finalize the booking for ${draftState.booking_id || activeBooking?.bookingId}.`, true);
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
    <div className="flex flex-col flex-1 min-h-0 h-full bg-white">
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Agent Status */}
        <aside className="w-[280px] bg-white border-r border-[#C7CEE8] flex-col min-h-0 hidden lg:flex">
           <div className="p-6 pb-2">
             <h2 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#157954]">System Agents</h2>
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
                  className={`p-3 rounded-xl border transition-all duration-300 relative overflow-hidden flex items-center gap-3 ${
                    agentStates[agent.id] === "WORKING"
                      ? 'bg-gradient-form-card border-[#157954] text-white shadow-md' 
                      : agentStates[agent.id] === "COMPLETED" 
                      ? 'bg-[#21263A] border-[#D0D34D] text-white shadow-sm' 
                      : 'bg-slate-50 border-[#C7CEE8]/60 hover:bg-slate-100 text-[#21263A]'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      agentStates[agent.id] === "WORKING" ? 'bg-[#D0D34D] text-[#21263A]' : 
                      agentStates[agent.id] === "COMPLETED" ? 'bg-[#157954] text-white' : 
                      'bg-white text-[#21263A]/60 border border-[#C7CEE8]/40'
                    }`}>
                      {agentStates[agent.id] === "COMPLETED" ? <CheckCircle2 className="w-4 h-4" /> : agentIcons[agent.id]}
                    </div>
                    <div>
                      <h3 className={`text-[13px] font-bold transition-colors ${
                        agentStates[agent.id] === "WORKING" ? 'text-white' : 
                        agentStates[agent.id] === "COMPLETED" ? 'text-white' : 'text-[#21263A]'
                      }`}>
                        {agent.name}
                      </h3>
                      <p className={`text-[11px] font-semibold mt-0.5 ${
                        agentStates[agent.id] === "WORKING" ? 'text-[#D0D34D]' : 
                        agentStates[agent.id] === "COMPLETED" ? 'text-[#D0D34D]' : 'text-[#21263A]/50'
                      }`}>
                        {agentStates[agent.id] === "WORKING" ? 'Working...' : 
                         agentStates[agent.id] === "COMPLETED" ? 'Completed' : 'Standby'}
                      </p>
                    </div>
                  </div>
                  {agentStates[agent.id] === "WORKING" && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#D0D34D]"
                    />
                  )}
                </div>
              ))}
           </div>
        </aside>

        {/* Center Column: Chat Interface */}
        <section className="flex-1 flex flex-col min-h-0 bg-white relative">
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-90 mt-32">
                   <div className="w-16 h-16 bg-gradient-palette-5 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                     <MessageSquare className="w-8 h-8 text-[#D0D34D]" />
                   </div>
                   <h2 className="text-xl font-extrabold text-[#21263A] mb-2">How can I help you today?</h2>
                   <p className="text-sm text-[#21263A]/70 max-w-sm leading-relaxed font-medium">
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
                     <div className="max-w-[85%] md:max-w-2xl bg-gradient-palette-5 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
                       <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
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
                       <div className="w-5 h-5 rounded-full bg-[#157954] flex items-center justify-center text-white">
                         {message.agent.toLowerCase().includes("verification") ? <ShieldCheck className="w-3 h-3 text-[#D0D34D]" /> : 
                          message.agent.toLowerCase().includes("document") ? <FileText className="w-3 h-3 text-[#D0D34D]" /> : 
                          message.agent.toLowerCase().includes("booking") ? <CalendarDays className="w-3 h-3 text-[#D0D34D]" /> : 
                          <Map className="w-3 h-3 text-[#D0D34D]" />}
                       </div>
                       <span className="text-[11px] font-extrabold text-[#157954] uppercase tracking-widest">
                         {message.agent.replace(/\[|\]/g, "").trim().replace("_", " ")}
                       </span>
                     </div>
                   )}
                   <div className="max-w-[85%] md:max-w-2xl bg-gradient-form-card border border-[#157954]/40 px-5 py-4 rounded-2xl rounded-tl-sm shadow-xl text-white">
                     {message.text ? (
                       <div className="text-[15px] leading-loose whitespace-pre-wrap font-medium text-white">
                         {message.text.split('\n').map((line, i) => {
                           if (line.includes('**')) {
                             const parts = line.split('**');
                             return (
                               <p key={i} className="mb-2">
                                 {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-[#D0D34D] font-extrabold">{part}</strong> : part)}
                               </p>
                             )
                           }
                           return <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
                         })}
                       </div>
                     ) : (
                       <div className="flex gap-1.5 items-center h-6 px-2">
                         <div className="w-1.5 h-1.5 bg-[#D0D34D] rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-[#D0D34D] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                         <div className="w-1.5 h-1.5 bg-[#D0D34D] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                       </div>
                     )}

                     {message.propertyCard && (
                       <div className="mt-6 rounded-xl overflow-hidden border border-[#C7CEE8]/30 shadow-md bg-white group cursor-pointer hover:shadow-lg transition-all duration-300">
                         <div className="h-48 w-full overflow-hidden relative">
                           <img
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                             alt={message.propertyCard.title}
                             src={message.propertyCard.image}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#21263A]/80 via-[#21263A]/20 to-transparent"></div>
                           <div className="absolute bottom-4 left-5 text-white">
                              <h4 className="font-bold text-xl leading-tight mb-1">{message.propertyCard.title}</h4>
                              <p className="text-[13px] text-white/90 font-medium flex items-center gap-1.5">
                                 <MapPin className="w-3.5 h-3.5 text-[#D0D34D]" />
                                 Nuwara Eliya
                              </p>
                           </div>
                         </div>
                         <div className="p-5 flex justify-between items-center bg-gradient-bungalow-card text-white">
                           <div>
                             <p className="text-[15px] font-bold text-white">{message.propertyCard.suite}</p>
                           </div>
                           <div className="text-right">
                             <span className="text-[#D0D34D] font-extrabold text-xl">{message.propertyCard.price}</span>
                             <p className="text-[11px] text-[#C7CEE8] font-bold uppercase tracking-wider">per night</p>
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

          {/* Chat Input Card */}
          <div className="p-6 md:p-8 shrink-0 bg-white border-t border-[#C7CEE8]/40">
             <div className="max-w-3xl mx-auto">
               <div className="flex gap-2 mb-4 px-1 overflow-x-auto no-scrollbar">
                 <button onClick={() => handleSendMessage("Tell me more about the amenities")} className="shrink-0 text-[13px] font-bold text-[#21263A] bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-[#157954]/30 transition-all flex items-center gap-2 shadow-sm">
                   <Sparkles className="w-3.5 h-3.5 text-[#157954]" />
                   Amenities
                 </button>
                 <button onClick={() => handleSendMessage("What bungalows are available in Nuwara Eliya?")} className="shrink-0 text-[13px] font-bold text-[#21263A] bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-[#157954]/30 transition-all flex items-center gap-2 shadow-sm">
                   <Search className="w-3.5 h-3.5 text-[#157954]" />
                   Search bungalows
                 </button>
               </div>
               
               <div className="relative flex items-center bg-gradient-form-card border border-[#157954]/50 rounded-2xl p-2 shadow-xl focus-within:ring-2 focus-within:ring-[#D0D34D] transition-all">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
                 <button 
                   onClick={() => fileInputRef.current?.click()} 
                   className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                     attachment ? 'text-[#21263A] bg-[#D0D34D]' : 'text-[#C7CEE8] hover:text-white hover:bg-[#21263A]/80'
                   }`}
                 >
                    <Paperclip className="w-5 h-5" />
                 </button>
                 <input
                   type="text"
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={handleKeyPress}
                   placeholder="Type your message to GovSewana Support..."
                   className="flex-1 bg-transparent border-0 px-4 py-2 text-[15px] font-medium text-white placeholder:text-[#C7CEE8]/50 focus:outline-none focus:ring-0"
                 />
                 <button
                   onClick={() => handleSendMessage()}
                   disabled={!inputText.trim() && !attachment}
                   className="w-10 h-10 rounded-xl bg-[#D0D34D] text-[#21263A] flex items-center justify-center hover:bg-[#c3c642] disabled:opacity-40 transition-all shrink-0 shadow-sm"
                 >
                   <Send className="w-4 h-4 text-[#21263A]" />
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
            className="bg-white border-l border-[#C7CEE8] flex flex-col min-h-0 shadow-lg"
          >
             <div className="p-6 pb-4 flex items-center gap-3 border-b border-[#C7CEE8]/40">
               <div className="w-8 h-8 rounded-full bg-[#157954]/10 flex items-center justify-center">
                 <FileText className="w-4 h-4 text-[#157954]" />
               </div>
               <h2 className="text-[14px] font-bold text-[#21263A]">Booking Summary</h2>
             </div>
             
              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</label>
                   <input 
                     type="text" 
                     value={activeBooking?.user?.empId || draftState.emp_id || ""} 
                     onChange={e => !activeBooking && setDraftState({...draftState, emp_id: e.target.value})}
                     readOnly={!!activeBooking}
                     className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-[#157954] focus:ring-1 focus:ring-[#157954] outline-none transition-all"
                     placeholder="e.g. EMP-123"
                   />
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Room</label>
                   <input 
                     type="text" 
                     value={activeBooking?.room?.roomNumber || draftState.room_number || ""} 
                     onChange={e => !activeBooking && setDraftState({...draftState, room_number: e.target.value})}
                     readOnly={!!activeBooking}
                     className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-[#157954] focus:ring-1 focus:ring-[#157954] outline-none transition-all"
                     placeholder="e.g. OLD-101"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-in</label>
                     <input 
                       type="date" 
                       value={activeBooking?.fromDate ? new Date(activeBooking.fromDate).toISOString().split('T')[0] : (draftState.from_date || "")} 
                       onChange={e => !activeBooking && setDraftState({...draftState, from_date: e.target.value})}
                       readOnly={!!activeBooking}
                       className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-[#157954] outline-none transition-all"
                     />
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-out</label>
                     <input 
                       type="date" 
                       value={activeBooking?.toDate ? new Date(activeBooking.toDate).toISOString().split('T')[0] : (draftState.to_date || "")} 
                       onChange={e => !activeBooking && setDraftState({...draftState, to_date: e.target.value})}
                       readOnly={!!activeBooking}
                       className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 font-medium focus:bg-white focus:border-[#157954] outline-none transition-all"
                     />
                  </div>
                </div>

                {(activeBooking?.totalCost || draftState.total_cost) && (
                   <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl mt-2 shadow-sm">
                     <span className="text-[13px] font-bold text-slate-600 uppercase tracking-wider">Total Cost</span>
                     <span className="text-[16px] font-extrabold text-[#157954]">LKR {(activeBooking?.totalCost || draftState.total_cost).toLocaleString()}</span>
                   </div>
                )}

                <div className="mt-2">
                   <PaymentSlipUpload 
                     onUploadComplete={setPaymentSlipUrl}
                     bookingId={draftState.booking_id || activeBooking?.bookingId || ""}
                     value={paymentSlipUrl}
                   />
                </div>

                {/* Action / Checkout Card */}
                <div className="bg-gradient-form-card border border-[#157954]/50 text-white p-6 rounded-2xl shadow-xl mt-auto flex flex-col gap-5">
                   
                    <div className="flex justify-between items-center pb-5 border-b border-[#C7CEE8]/30">
                       <span className="text-[#C7CEE8] text-[13px] font-medium">Status</span>
                       <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${
                         activeBooking?.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300' : 
                         activeBooking?.status === 'PENDING' && activeBooking?.paymentSlipUrl ? 'bg-[#D0D34D]/20 text-[#D0D34D]' : 
                         (!activeBooking || (activeBooking?.status === 'PENDING' && !activeBooking?.paymentSlipUrl)) && (activeBooking?.bookingId || draftState.booking_id) ? 'bg-blue-500/20 text-blue-300' :
                         'bg-white/10 text-white'
                      }`}>
                         {activeBooking?.status === 'CONFIRMED' ? '✓ Confirmed' : activeBooking?.status === 'PENDING' && activeBooking?.paymentSlipUrl ? '⏳ Payment Verification' : (!activeBooking || (activeBooking?.status === 'PENDING' && !activeBooking?.paymentSlipUrl)) && (activeBooking?.bookingId || draftState.booking_id) ? '⏳ Awaiting Payment Slip' : 'Draft'}
                      </span>
                   </div>
                   
                   {(activeBooking?.bookingId || draftState.booking_id) && (
                     <div className="flex justify-between items-center">
                       <span className="text-[#C7CEE8] text-[13px] font-medium">Booking ID</span>
                       <span className="text-white text-[13px] font-bold">{activeBooking?.bookingId || draftState.booking_id}</span>
                     </div>
                   )}

                   <div className="flex items-center justify-between">
                     <label className="text-[13px] font-medium text-white/90 cursor-pointer flex items-center gap-2" htmlFor="whatsapp-toggle">
                       <MessageSquare className="w-4 h-4 text-[#D0D34D]" />
                       WhatsApp Updates
                     </label>
                     <div className="relative inline-block w-10 h-5">
                       <input
                         checked={whatsappEnabled}
                         onChange={(e) => setWhatsappEnabled(e.target.checked)}
                         disabled={!!activeBooking}
                         className="sr-only peer disabled:opacity-50"
                         id="whatsapp-toggle"
                         type="checkbox"
                       />
                       <div className="w-full h-full bg-[#21263A] rounded-full peer peer-checked:bg-[#157954] transition-colors cursor-pointer border border-[#C7CEE8]/30"></div>
                       <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 cursor-pointer shadow-sm"></div>
                     </div>
                   </div>

                   {(!activeBooking || (activeBooking?.status === "PENDING" && !activeBooking?.paymentSlipUrl)) ? (
                     <button
                       onClick={triggerConfirmBooking}
                       className="w-full py-4 bg-[#D0D34D] hover:bg-[#c3c642] text-[#21263A] font-extrabold rounded-xl transition-transform active:scale-[0.98] shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                     >
                       {activeBooking?.bookingId || draftState.booking_id ? 'Verify Payment Slip' : 'Confirm Details'}
                     </button>
                   ) : activeBooking?.status === "PENDING" && activeBooking?.paymentSlipUrl ? (
                     <button
                       disabled
                       className="w-full py-4 bg-white/10 text-white font-bold rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                     >
                       <Loader2 className="w-5 h-5 animate-spin text-[#D0D34D]" />
                       Verification in progress
                     </button>
                   ) : (
                     <button
                       disabled
                       className="w-full py-4 bg-[#157954] text-white font-bold rounded-xl shadow-md mt-2 flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 className="w-5 h-5 text-[#D0D34D]" />
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