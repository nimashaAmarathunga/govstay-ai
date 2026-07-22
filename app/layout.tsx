import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="light h-full">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="h-full bg-background text-on-surface overflow-hidden flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
