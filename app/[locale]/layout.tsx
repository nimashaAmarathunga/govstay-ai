import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";
import Navigation from "@/components/layout/Navigation";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "GovStay AI - Government Accommodation Booking & Verification",
  description:
    "Centralized discovery, real-time status monitoring, and automated allocation platform for government circuit bungalows and rest houses in Sri Lanka.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "si")) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="light h-full" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 flex flex-col antialiased ${
          locale === "si" ? "font-sinhala" : ""
        }`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>
            <Navigation />
            <div className="flex-1 flex flex-col min-h-0">{children}</div>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
