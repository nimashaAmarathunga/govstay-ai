"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "buttons" | "dropdown";
}

export default function LanguageSwitcher({
  className = "",
  variant = "buttons",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: "en" | "si") => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <select
          value={locale}
          disabled={isPending}
          onChange={(e) => handleLanguageChange(e.target.value as "en" | "si")}
          className="appearance-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border border-slate-300/80 dark:border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          aria-label="Change language"
        >
          <option value="en">English (EN)</option>
          <option value="si">සිංහල (SI)</option>
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-2 text-base text-slate-500">
          expand_more
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleLanguageChange("en")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1 ${
          locale === "en"
            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <span>EN</span>
      </button>

      <span className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleLanguageChange("si")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1 ${
          locale === "si"
            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold font-sinhala"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-sinhala"
        }`}
      >
        <span>සිංහල</span>
      </button>
    </div>
  );
}
