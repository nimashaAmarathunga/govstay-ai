"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Sparkles, MapPin, Users, Loader2, Calendar, Save, Download, RefreshCw, Clock, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Attraction } from "./MapWrapper";

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bungalowName: string;
  bungalowArea: string;
  attractions: Attraction[];
}

export default function TripPlannerModal({ isOpen, onClose, bungalowName, bungalowArea, attractions }: TripPlannerModalProps) {
  const [travelGroup, setTravelGroup] = useState("Family");
  const [interests, setInterests] = useState("Nature & Scenery");
  const [tripDuration, setTripDuration] = useState("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<string | null>(null);

  const parsedItinerary = useMemo(() => {
    if (!itinerary) return null;
    
    // Strip agent system prefixes
    const cleanText = itinerary.replace(/^itinerary_agent/i, '');
    const parts = cleanText.split(/##\s+/);
    
    const intro = parts[0].trim();
    const days = parts.slice(1).map(dayPart => {
      const lines = dayPart.split('\n');
      const title = lines[0].trim();
      const activities: any[] = [];
      let currentActivity: any = null;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('-')) {
          if (currentActivity) activities.push(currentActivity);
          
          const headerMatch = line.match(/\*\*(.*?)\*\*/);
          let header = headerMatch ? headerMatch[1] : '';
          let desc = line.replace(/^-/, '').trim();
          
          if (headerMatch) {
             desc = desc.replace(`**${header}**`, '').trim();
          }
          if (desc.startsWith(':')) desc = desc.substring(1).trim();
          if (desc.startsWith('-')) desc = desc.substring(1).trim();

          let time = '';
          let titleText = header;
          if (header.includes('-')) {
             const hparts = header.split('-');
             time = hparts[0].trim();
             titleText = hparts.slice(1).join('-').trim();
          } else if (header.match(/\d{1,2}:\d{2}/)) {
             time = header;
             titleText = '';
          }

          currentActivity = { time, title: titleText, desc };
        } else if (line && currentActivity) {
          currentActivity.desc += '\n' + line;
        }
      }
      if (currentActivity) activities.push(currentActivity);
      return { title, activities };
    });
    
    return { intro, days };
  }, [itinerary]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setItinerary(null);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bungalowName,
          bungalowLocation: bungalowArea,
          attractions: attractions.map(a => a.title),
          travelGroup,
          interests,
          tripDuration,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setItinerary(`Error: ${data.error || 'Failed to generate itinerary'}`);
        setIsGenerating(false);
        return;
      }

      setIsGenerating(false);
      setItinerary("");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr === '[DONE]' || !dataStr) continue;
              try {
                const dataObj = JSON.parse(dataStr);
                if (dataObj.delta) {
                  fullText += dataObj.delta;
                  setItinerary(fullText);
                } else if (dataObj.reply && !fullText) {
                  fullText = dataObj.reply;
                  setItinerary(fullText);
                }
              } catch (e) {
                // Ignore incomplete SSE chunks
              }
            }
          }
        }
      }
    } catch (err) {
      setItinerary("Error connecting to AI Travel Planner.");
      setIsGenerating(false);
    }
  };

  const renderFormattedDesc = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return { __html: html };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />
          
          {/* Centered Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-slate-50 max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
          >
            {/* Sticky Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none mb-1">AI Travel Planner</h2>
                    <p className="text-xs font-semibold text-slate-500">Powered by Agent Kernel</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {bungalowArea}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {tripDuration} Days
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {travelGroup}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
              
              {/* Setup Form */}
              {!itinerary && !isGenerating && (
                <div className="space-y-6 max-w-md mx-auto mt-4">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Map className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Build Your Perfect Trip</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Let our AI analyze attractions around <strong>{bungalowName}</strong> and craft a personalized day-by-day itinerary.
                    </p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Travel Group</label>
                      <select 
                        value={travelGroup}
                        onChange={(e) => setTravelGroup(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3.5 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        <option value="Family with Kids">Family with Kids</option>
                        <option value="Couple">Couple</option>
                        <option value="Group of Friends">Group of Friends</option>
                        <option value="Solo Traveler">Solo Traveler</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                      <select 
                        value={tripDuration}
                        onChange={(e) => setTripDuration(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3.5 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        <option value="2">2 Days (Weekend)</option>
                        <option value="3">3 Days</option>
                        <option value="5">5 Days</option>
                        <option value="7">1 Week</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interests & Pace</label>
                      <input 
                        type="text"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="e.g. Relaxed, Historic, Foodie"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3.5 font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-transform active:scale-[0.98] shadow-lg shadow-slate-900/20"
                  >
                    <Sparkles className="w-5 h-5" /> Generate Itinerary
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 space-y-5 h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin relative z-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Crafting your itinerary...</h3>
                    <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                      Analyzing nearby attractions and calculating travel times.
                    </p>
                  </div>
                </div>
              )}

              {/* Itinerary Display */}
              {parsedItinerary && (
                <div className="space-y-6 pb-20">
                  {/* Intro Text */}
                  {parsedItinerary.intro && parsedItinerary.intro.replace(/\*/g, '') !== "" && (
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-slate-600 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={renderFormattedDesc(parsedItinerary.intro)} 
                     />
                  )}

                  {/* Days Timeline */}
                  {parsedItinerary.days.map((day, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      {/* Day Header */}
                      <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-black text-white tracking-wide">
                          Day {idx + 1}
                        </h3>
                        <span className="text-slate-300 text-sm font-semibold truncate max-w-[200px]">
                           {day.title.replace(/^Day \d+:/i, '').replace(/^Day \d+/i, '').replace(/^:/, '').trim()}
                        </span>
                      </div>
                      
                      {/* Day Activities */}
                      <div className="p-6">
                        <div className="relative pl-6 border-l-[3px] border-slate-100 space-y-8">
                          {day.activities.map((act, i) => (
                            <div key={i} className="relative group">
                              {/* Timeline Node */}
                              <div className="absolute -left-[32px] top-1 w-4 h-4 rounded-full border-[3px] border-emerald-500 bg-white group-hover:bg-emerald-50 transition-colors"></div>
                              
                              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                {act.time && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                    <Clock className="w-3 h-3 text-emerald-600" /> {act.time}
                                  </span>
                                )}
                                {act.title && (
                                  <h4 className="text-base font-bold text-slate-900">{act.title}</h4>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed" 
                                 dangerouslySetInnerHTML={renderFormattedDesc(act.desc)} 
                              />
                            </div>
                          ))}
                          {day.activities.length === 0 && (
                            <div className="text-slate-400 text-sm italic">Planning activities...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            {itinerary && !isGenerating && (
              <div className="px-6 py-4 border-t border-slate-200 bg-white sticky bottom-0 z-20 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                 <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-transform active:scale-[0.98] shadow-md">
                    <RefreshCw className="w-5 h-5" /> Regenerate Itinerary
                 </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
