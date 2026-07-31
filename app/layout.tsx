import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "GovStay AI - Government Accommodation Booking & Verification",
  description: "Centralized discovery, real-time status monitoring, and automated allocation platform for government circuit bungalows and rest houses in Sri Lanka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light h-full" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased" suppressHydrationWarning>
        <AppProviders>
          <Navigation />
          <div className="flex-1 flex flex-col min-h-0">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
