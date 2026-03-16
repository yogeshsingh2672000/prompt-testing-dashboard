"use client";

import { Plus, CheckCircle2 } from "lucide-react";
import { TestCase } from "@/types";
import { TestCaseItem } from "./TestCaseItem";

interface TestCasesSectionProps {
    testCases: TestCase[];
    addTestCase: () => void;
    updateTestCase: (id: string, field: keyof TestCase, value: string) => void;
    removeTestCase: (id: string) => void;
}

export function TestCasesSection({
    testCases,
    addTestCase,
    updateTestCase,
    removeTestCase
}: TestCasesSectionProps) {
    return (
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 md:p-8 rounded-3xl backdrop-blur-sm min-h-[400px] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-blue-400" /> Test Cases
                        <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 font-bold border border-zinc-700">
                            {testCases.length}
                        </span>
                    </h2>
                    <button
                        onClick={addTestCase}
                        className="w-full sm:w-auto text-zinc-100 transition-all flex items-center justify-center gap-2 text-sm font-bold bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl border border-zinc-700 shadow-lg active:scale-95"
                    >
                        <Plus size={18} /> Add Test Case
                    </button>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {testCases.map((tc, index) => (
                        <TestCaseItem
                            key={tc.id}
                            tc={tc}
                            index={index}
                            updateTestCase={updateTestCase}
                            removeTestCase={removeTestCase}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
