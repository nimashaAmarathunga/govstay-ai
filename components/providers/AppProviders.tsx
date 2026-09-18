"use client";

import React from "react";
import { ModeProvider } from "@/components/context/ModeContext";
import { UserProvider } from "@/components/context/UserContext";
import { ChatProvider } from "@/components/context/ChatContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <UserProvider>
        <ChatProvider>{children}</ChatProvider>
      </UserProvider>
    </ModeProvider>
  );
}
