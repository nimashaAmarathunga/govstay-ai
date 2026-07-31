"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AppMode = "user" | "admin" | "developer";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  isAdminMode: boolean;
  isUserMode: boolean;
  isDeveloperMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const STORAGE_KEY = "govstay_app_mode";

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("user");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY) as AppMode;
      if (savedMode === "user" || savedMode === "admin" || savedMode === "developer") {
        setModeState(savedMode);
      }
    } catch {
      // localStorage read failed, fallback to default 'user'
    }
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // localStorage write failed
    }
  };

  const toggleMode = () => {
    if (mode === "user") setMode("admin");
    else if (mode === "admin") setMode("developer");
    else setMode("user");
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isAdminMode: mode === "admin",
        isUserMode: mode === "user",
        isDeveloperMode: mode === "developer",
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextType {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
