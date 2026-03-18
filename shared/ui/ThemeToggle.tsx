"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const t = useTranslations("ui.theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 shadow-lg active:scale-95 overflow-hidden"
      aria-label={t("toggle")}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {theme === "dark" ? (
        <Sun size={20} className="text-zinc-400 group-hover:text-amber-400 transition-all duration-500 rotate-0 group-hover:rotate-12 group-hover:scale-110" />
      ) : (
        <Moon size={20} className="text-zinc-600 group-hover:text-indigo-600 transition-all duration-500 rotate-0 group-hover:-rotate-12 group-hover:scale-110" />
      )}
    </button>
  );
}
