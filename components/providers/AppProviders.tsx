"use client";

import React from "react";
import { ModeProvider } from "@/components/context/ModeContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <ModeProvider>{children}</ModeProvider>;
}
