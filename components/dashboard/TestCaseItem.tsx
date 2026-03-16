"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { TestCase } from "@/types";

interface TestCaseItemProps {
    tc: TestCase;
    index: number;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    removeTestCase: (id: string) => void;
}

export const TestCaseItem = React.memo(({ tc, index, updateTestCase, removeTestCase }: TestCaseItemProps) => {
    return (
        <div className="grid grid-cols-12 gap-2 rounded-2xl relative group hover:bg-white/[0.01] transition-all p-2">
            <div className="col-span-1 flex flex-col items-center justify-center pt-5">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:border-teal-500/30 group-hover:text-teal-400 transition-all shadow-inner">
                    {index + 1}
                </div>
            </div>
            <div className="col-span-5 space-y-2">
                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-tighter ml-1">Test Input</label>
                <textarea
                    value={tc.input}
                    onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                    className="w-full overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/10 min-h-[80px] text-sm transition-all resize-none"
                    placeholder="Enter test input context..."
                />
            </div>
            <div className="col-span-5 space-y-2">
                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-tighter ml-1">Expected Output</label>
                <textarea
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                    // [&::-webkit-scrollbar]:hidden
                    className="w-full overflow-y-auto custom-scrollbar bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/10 min-h-[80px] text-sm transition-all resize-none"
                    placeholder="Enter expected outcome..."
                />
            </div>
            <div className="col-span-1 flex items-center justify-center pt-5">
                <button
                    onClick={() => removeTestCase(tc.id)}
                    className="p-3 text-zinc-700 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Test Case"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
});

TestCaseItem.displayName = "TestCaseItem";
