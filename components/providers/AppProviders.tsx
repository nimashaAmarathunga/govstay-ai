"use client";

import React from "react";
import { ModeProvider } from "@/components/context/ModeContext";
import { UserProvider } from "@/components/context/UserContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <UserProvider>{children}</UserProvider>
    </ModeProvider>
  );
}
