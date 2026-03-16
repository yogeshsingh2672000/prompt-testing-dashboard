"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "hi", name: "हिन्दी", flag: "🇮🇳" }
    ];

    const toggleLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
        setIsOpen(false);
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 shadow-lg active:scale-95 overflow-hidden"
                aria-label="Change language"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Languages size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-teal-500 text-white px-1 rounded uppercase">
                    {locale}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => toggleLanguage(lang.code)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                    locale === lang.code
                                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                                )}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="flex-1 text-left">{lang.name}</span>
                                {locale === lang.code && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
