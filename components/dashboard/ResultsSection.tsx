"use client";

import { useState } from "react";
import { EvaluationResult, TestCase } from "@/types";
import { cn } from "@/lib/utils";
import { ResultRow } from "./ResultRow";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("results");
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
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-2xl relative overflow-hidden group transition-all duration-500">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none" />
                <h2 className="font-black flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xl md:text-2xl text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-3">
                        {t("title")}
                        <span className="text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full text-zinc-500 dark:text-zinc-400 font-black">
                            {results.length} {t("total")}
                        </span>
                    </div>
                    {results.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg">
                                <span className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest">{t("avgSimilarity")}</span>
                                <span className="text-base font-mono font-black text-zinc-900 dark:text-zinc-100">{averageSimilarity.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-2xl shadow-xl ring-1 ring-teal-500/10">
                                <span className="text-[10px] uppercase font-black text-teal-600 dark:text-zinc-400 tracking-widest">{t("avgSemantic")}</span>
                                <span className="text-base font-mono font-black text-teal-600 dark:text-teal-400">{averageSemantic.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl shadow-xl ring-1 ring-emerald-500/10">
                                <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-zinc-400 tracking-widest">{t("passRate")}</span>
                                <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">{passPercentage.toFixed(0)}% <span className="text-xs opacity-60 ml-1 font-bold">({passCount}/{results.length})</span></span>
                            </div>
                        </div>
                    )}
                </h2>
                <div className="w-full xl:w-auto flex bg-zinc-100 dark:bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner transition-all duration-300">
                    {(["all", "pass", "fail"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 xl:flex-none px-6 py-2.5 rounded-xl transition-all duration-300",
                                filter === f 
                                    ? (f === "all" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-lg" : f === "pass" ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg" : "bg-red-500 text-white shadow-red-500/20 shadow-lg") 
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            )}
                        >
                            {t(f)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-black">
                                <th className="p-6 pl-8 w-20"># {t("table.id")}</th>
                                <th className="p-6 w-40">{t("table.status")}</th>
                                <th className="p-6 w-32 text-center">{t("table.similarity")}</th>
                                <th className="p-6 w-32 text-center">{t("table.semantic")}</th>
                                <th className="p-6">{t("table.output")}</th>
                                <th className="p-6 pr-8">{t("table.expected")}</th>
                            </tr>
                        </thead>
                    <tbody className="text-sm">
                        {loading && results.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-zinc-500 animate-pulse font-medium">
                                    {t("evaluating")}
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
                                    {filter !== "all" ? t("noResults") : t("noResults")}
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
