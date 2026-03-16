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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm shadow-lg">
                <h2 className="font-semibold flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        Evaluation Results
                        {results.length > 0 && (<span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-normal">
                            {results.length} total
                        </span>)}
                    </div>
                    {results.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 border border-zinc-800 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Avg Vector:</span>
                                <span className="text-xs font-mono font-bold text-zinc-400">{averageSimilarity.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Avg Semantic:</span>
                                <span className="text-xs font-mono font-bold text-teal-400">{averageSemantic.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Pass Rate:</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">{passPercentage.toFixed(0)}% <span className="text-[10px] opacity-70">({passCount}/{results.length})</span></span>
                            </div>
                        </div>
                    )}
                </h2>
                <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                    {(["all", "pass", "fail"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-1.5 rounded-md transition-all",
                                filter === f
                                    ? (f === "all" ? "bg-zinc-800 text-white" : f === "pass" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-zinc-800 rounded-2xl bg-zinc-900/50 backdrop-blur-sm shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                            <th className="p-4 pl-6 w-16">#</th>
                            <th className="p-4 w-32">Status</th>
                            <th className="p-4 w-28 text-center">Vector</th>
                            <th className="p-4 w-28 text-center">Semantic</th>
                            <th className="p-4">Response</th>
                            <th className="p-4 pr-6">Expected</th>
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
    );
}
