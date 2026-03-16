"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { TestCase } from "@/types";
import { useTranslations } from "next-intl";

interface TestCaseItemProps {
    tc: TestCase;
    index: number;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    removeTestCase: (id: string) => void;
}

export const TestCaseItem = React.memo(({ tc, index, updateTestCase, removeTestCase }: TestCaseItemProps) => {
    const t = useTranslations("testCases");

    return (
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-2 rounded-2xl relative group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all p-4 border border-transparent md:border-dashed md:hover:border-zinc-200 dark:md:hover:border-zinc-800">
            <div className="md:col-span-1 flex items-center justify-between md:flex-col md:justify-center">
                <div className="w-10 h-10 md:w-8 md:h-8 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 md:bg-white dark:md:bg-zinc-900 md:border md:border-zinc-200 dark:md:border-zinc-800 rounded-xl flex items-center justify-center text-sm md:text-xs font-black text-zinc-500 dark:text-zinc-400 group-hover:border-teal-500/50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all shadow-xl">
                    {index + 1}
                </div>
                <button
                    onClick={() => removeTestCase(tc.id)}
                    className="md:hidden p-2.5 text-red-600 dark:text-red-500 bg-red-500/10 rounded-xl"
                    title={t("remove")}
                >
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t("inputContext")}</label>
                <textarea
                    value={tc.input}
                    onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                    className="w-full bg-zinc-100/50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 min-h-[100px] md:min-h-[80px] text-sm transition-all resize-none shadow-inner placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    placeholder={t("inputPlaceholder")}
                />
            </div>
            <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t("expectedOutput")}</label>
                <textarea
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                    className="w-full custom-scrollbar bg-zinc-100/50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 min-h-[100px] md:min-h-[80px] text-sm transition-all resize-none shadow-inner placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    placeholder={t("expectedPlaceholder")}
                />
            </div>
            <div className="hidden md:flex md:col-span-1 items-center justify-center pt-5">
                <button
                    onClick={() => removeTestCase(tc.id)}
                    className="p-3 text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
                    title={t("remove")}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
});

TestCaseItem.displayName = "TestCaseItem";
