"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { TestCase } from "@/types";
import { useTranslations } from "next-intl";
import { extractVariables } from "@/lib/utils";

interface TestCaseItemProps {
    tc: TestCase;
    index: number;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    updateVariable: (id: string, key: string, value: string) => void;
    removeTestCase: (id: string) => void;
    systemPrompt: string;
    userInputTemplate: string;
}

export const TestCaseItem = React.memo(({
    tc,
    index,
    updateTestCase,
    updateVariable,
    removeTestCase,
    systemPrompt,
    userInputTemplate
}: TestCaseItemProps) => {
    const t = useTranslations("testCases");

    // Detect variables from both prompts
    const variables = Array.from(new Set([
        ...extractVariables(systemPrompt),
        ...extractVariables(userInputTemplate)
    ]));

    return (
        <div className="flex flex-col gap-4 rounded-3xl relative group bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 p-6 transition-all hover:bg-white/60 dark:hover:bg-zinc-900/60 shadow-lg">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center text-xs font-black shadow-lg">
                        {index + 1}
                    </div>
                    <span className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest leading-none mt-1">
                        Test Case Suite
                    </span>
                </div>
                <button
                    onClick={() => removeTestCase(tc.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title={t("remove")}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs & Variables Column */}
                <div className="space-y-6">
                    {/* Standard Input (only if no variables or as a general context) */}
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider ml-1">Input Context</label>
                        <textarea
                            value={tc.input}
                            onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                            className="w-full bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[100px] text-sm transition-all resize-none shadow-inner"
                            placeholder="Enter test scenario..."
                        />
                    </div>

                    {/* Dynamic Variables Grid */}
                    {variables.length > 0 && (
                        <div className="space-y-3">
                            <label className="block text-[10px] uppercase font-black text-teal-500/80 tracking-wider ml-1">{`Variables ({"{{"}}{"}}"} detected)`}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {variables.map(v => (
                                    <div key={v} className="space-y-1.5">
                                        <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">{`{{${v}}}`}</div>
                                        <input
                                            type="text"
                                            value={tc.variables?.[v] || ""}
                                            onChange={(e) => updateVariable(tc.id, v, e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                                            placeholder={`Value for ${v}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Expected Output Column */}
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider ml-1">Expected Output</label>
                    <textarea
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                        className="w-full h-full bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all resize-none shadow-inner"
                        placeholder="Expected behavior..."
                    />
                </div>
            </div>
        </div>
    );
});

TestCaseItem.displayName = "TestCaseItem";
