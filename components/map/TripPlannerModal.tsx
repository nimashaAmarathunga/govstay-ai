"use client";

import React, { useState } from "react";
import { X, Sparkles, MapPin, Users, Loader2 } from "lucide-react";
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

  if (!isOpen) return null;

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
      
      const data = await res.json();
      if (res.ok) {
        // Handle Agent Kernel response structure
        const reply = data.reply || data.result?.text || data.text || "Failed to parse itinerary.";
        setItinerary(reply);
      } else {
        setItinerary(`Error: ${data.error}`);
      }
    } catch (err) {
      setItinerary("Error connecting to AI Travel Planner.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">AI Travel Planner</h2>
              <p className="text-xs text-slate-500 font-medium">Powered by Groq • Dest: {bungalowArea}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!itinerary && !isGenerating && (
            <div className="space-y-6">
              <p className="text-slate-600 text-sm">
                Let our AI build a custom itinerary for your stay at <strong>{bungalowName}</strong>, taking into account the nearest attractions like {attractions[0]?.title}.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Who is traveling?</label>
                  <select 
                    value={travelGroup}
                    onChange={(e) => setTravelGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Family with Kids">Family with Kids</option>
                    <option value="Couple">Couple</option>
                    <option value="Group of Friends">Group of Friends</option>
                    <option value="Solo Traveler">Solo Traveler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Trip Duration (Days)</label>
                  <select 
                    value={tripDuration}
                    onChange={(e) => setTripDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="2">2 Days (Weekend)</option>
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">1 Week</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Primary Interests</label>
                  <input 
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Nature, History, Local Food, Relaxing"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
              >
                Generate Itinerary
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <h3 className="text-lg font-bold text-slate-800">Consulting Travel AI...</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm">
                Analyzing nearby attractions in {bungalowArea} and crafting the perfect {tripDuration}-day plan for your {travelGroup.toLowerCase()}.
              </p>
            </div>
          )}

          {itinerary && !isGenerating && (
            <div className="space-y-4">
              <div className="prose prose-sm prose-emerald max-w-none">
                <div dangerouslySetInnerHTML={{ __html: itinerary.replace(/\n/g, '<br/>') }} className="whitespace-pre-wrap text-slate-700 leading-relaxed" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setItinerary(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Start Over
                </button>
                <button 
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Looks Great!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
