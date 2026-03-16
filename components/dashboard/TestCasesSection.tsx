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
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm min-h-[400px] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-blue-400" /> Test Cases
                    </h2>
                    <button
                        onClick={addTestCase}
                        className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs font-medium bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50 hover:border-zinc-600"
                    >
                        <Plus size={16} /> Add Test Case
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
