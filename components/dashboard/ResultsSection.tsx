"use client";

import { useState } from "react";
import { EvaluationResult, TestCase } from "@/types";
import { cn } from "@/lib/utils";
import { ResultRow } from "./ResultRow";

interface ResultsSectionProps {
    results: EvaluationResult[];
    loading: boolean;
    testCases: TestCase[];
}

export function ResultsSection({
    results,
    loading,
    testCases
}: ResultsSectionProps) {
    const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");

    const averageSimilarity = results.length > 0
        ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length
        : 0;

    const averageSemantic = results.length > 0
        ? results.reduce((sum, r) => sum + r.semanticScore, 0) / results.length
        : 0;

    const passCount = results.filter(r => r.status === 'pass').length;
    const passPercentage = results.length > 0 ? (passCount / results.length) * 100 : 0;

    const filteredResults = results.filter((r) => {
        if (filter === "pass") return r.status === "pass";
        if (filter === "fail") return r.status === "fail";
        return true;
    });

    if (results.length === 0 && !loading) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-zinc-900/60 border border-zinc-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none" />
                <h2 className="font-black flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xl md:text-2xl">
                    <div className="flex items-center gap-3">
                        Evaluation Results
                        <span className="text-sm bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-zinc-400 font-black">
                            {results.length} total
                        </span>
                    </div>
                    {results.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800/80 border border-zinc-700 rounded-2xl shadow-lg">
                                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Avg Vector</span>
                                <span className="text-base font-mono font-black text-zinc-100">{averageSimilarity.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-2xl shadow-[0_0_25px_rgba(45,212,191,0.15)] ring-1 ring-teal-500/20">
                                <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Avg Semantic</span>
                                <span className="text-base font-mono font-black text-teal-400">{averageSemantic.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20">
                                <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Pass Rate</span>
                                <span className="text-base font-mono font-black text-emerald-400">{passPercentage.toFixed(0)}% <span className="text-xs opacity-60 ml-1 font-bold">({passCount}/{results.length})</span></span>
                            </div>
                        </div>
                    )}
                </h2>
                <div className="w-full xl:w-auto flex bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                    {(["all", "pass", "fail"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 xl:flex-none px-6 py-2.5 rounded-xl transition-all duration-300",
                                filter === f 
                                    ? (f === "all" ? "bg-zinc-800 text-white shadow-lg shadow-black/50" : f === "pass" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20") 
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-zinc-800/80 rounded-[2.5rem] bg-zinc-900/40 backdrop-blur-md shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-zinc-800/80 text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                                <th className="p-6 pl-8 w-20">#</th>
                                <th className="p-6 w-40">Status</th>
                                <th className="p-6 w-32 text-center">Vector</th>
                                <th className="p-6 w-32 text-center">Semantic</th>
                                <th className="p-6">LLM Response</th>
                                <th className="p-6 pr-8">Expected</th>
                            </tr>
                        </thead>
                    <tbody className="text-sm">
                        {loading && results.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-zinc-500 animate-pulse font-medium">
                                    Running parallel evaluations...
                                </td>
                            </tr>
                        ) : filteredResults.length > 0 ? (
                            filteredResults.map((result) => (
                                <ResultRow
                                    key={result.testCaseId}
                                    result={result}
                                    testCases={testCases}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-zinc-600 italic">
                                    No results found for current filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );
}
