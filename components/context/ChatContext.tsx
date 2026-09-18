"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "./UserContext";

export interface PropertyCard {
  title: string;
  suite: string;
  price: string;
  image: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  agent?: string;
  text: string;
  timestamp: string;
  propertyCard?: PropertyCard;
}

export interface DraftState {
  emp_id: string;
  room_number: string;
  from_date: string;
  to_date: string;
  total_cost?: number;
  booking_id?: string;
  status?: string;
}

export type AgentStates = Record<string, "STANDBY" | "WORKING" | "COMPLETED" | "ERROR">;

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionId: string;
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  agentStates: AgentStates;
  setAgentStates: React.Dispatch<React.SetStateAction<AgentStates>>;
  isBookingMode: boolean;
  setIsBookingMode: React.Dispatch<React.SetStateAction<boolean>>;
  whatsappEnabled: boolean;
  setWhatsappEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  startNewChat: () => void;
}

const defaultAgentStates: AgentStates = {
  verification_agent: "STANDBY",
  travel_agent: "STANDBY",
  booking_agent: "STANDBY",
  notification_agent: "STANDBY",
};

const defaultDraftState: DraftState = { emp_id: "", room_number: "", from_date: "", to_date: "" };

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { activeUser } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>(`demo-session-${Date.now()}`);
  const [draftState, setDraftState] = useState<DraftState>(defaultDraftState);
  const [agentStates, setAgentStates] = useState<AgentStates>(defaultAgentStates);
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  // Load from LocalStorage
  useEffect(() => {
    if (!activeUser) {
      // If logged out, maybe reset or keep anonymous chat? Let's keep a generic cache.
      const storageKey = 'govstay_chat_anon';
      loadState(storageKey);
      return;
    }
    
    const storageKey = `govstay_chat_${activeUser.id}`;
    loadState(storageKey);
  }, [activeUser]);

  const loadState = (storageKey: string) => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed.messages || []);
        setSessionId(parsed.sessionId || `demo-session-${Date.now()}`);
        setDraftState(parsed.draftState || defaultDraftState);
        setAgentStates(parsed.agentStates || defaultAgentStates);
        setIsBookingMode(parsed.isBookingMode || false);
        setWhatsappEnabled(parsed.whatsappEnabled ?? true);
      } else {
        // No stored state for this user, generate new session
        setSessionId(`demo-session-${Date.now()}`);
        setMessages([]);
        setDraftState(defaultDraftState);
        setAgentStates(defaultAgentStates);
        setIsBookingMode(false);
        setWhatsappEnabled(true);
      }
    } catch (e) {
      console.error("Failed to parse chat storage", e);
    } finally {
      setIsLoaded(true);
    }
  };

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    const storageKey = activeUser ? `govstay_chat_${activeUser.id}` : 'govstay_chat_anon';
    const stateToSave = {
      messages,
      sessionId,
      draftState,
      agentStates,
      isBookingMode,
      whatsappEnabled,
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [isLoaded, messages, sessionId, draftState, agentStates, isBookingMode, whatsappEnabled, activeUser]);

  const startNewChat = () => {
    setMessages([]);
    setSessionId(`demo-session-${Date.now()}`);
    setDraftState(defaultDraftState);
    setAgentStates(defaultAgentStates);
    setIsBookingMode(false);
    setWhatsappEnabled(true);
    // The useEffect will automatically save this fresh state to localStorage.
  };

  return (
    <ChatContext.Provider
      value={{
        messages, setMessages,
        sessionId,
        draftState, setDraftState,
        agentStates, setAgentStates,
        isBookingMode, setIsBookingMode,
        whatsappEnabled, setWhatsappEnabled,
        startNewChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
