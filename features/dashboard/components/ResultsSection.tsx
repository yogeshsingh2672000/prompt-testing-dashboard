"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { EvaluationResult, TestCase } from "@/shared/types";
import { cn, formatCost } from "@/shared/lib/utils";
import { ResultRow } from "./ResultRow";
import { ExportActions } from "./ExportActions";
import { useTranslations } from "next-intl";

interface ResultsSectionProps {
    results: EvaluationResult[];
    loading: boolean;
    testCases: TestCase[];
    error?: string | null;
}

export function ResultsSection({
    results,
    loading,
    testCases,
    error
}: ResultsSectionProps) {
    const t = useTranslations("results");
    const tm = useTranslations("ui.metrics");
    const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");

    const averageSimilarity = results.length > 0
        ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length
        : 0;

    const averageSemantic = results.length > 0
        ? results.reduce((sum, r) => sum + r.semanticScore, 0) / results.length
        : 0;

    const passCount = results.filter(r => r.status === 'pass').length;
    const passPercentage = results.length > 0 ? (passCount / results.length) * 100 : 0;

    const totalCost = results.reduce((sum, r) => sum + (r.metrics?.costUsd || 0), 0);
    const avgLatency = results.length > 0
        ? results.reduce((sum, r) => sum + (r.metrics?.latencyMs || 0), 0) / results.length
        : 0;
    const validationEnabledCount = results.filter((result) => result.validation?.enabled).length;
    const validationPassCount = results.filter((result) => result.validation?.enabled && result.validation.passed).length;
    const validationPassRate = validationEnabledCount > 0 ? (validationPassCount / validationEnabledCount) * 100 : 0;

    const filteredResults = results.filter((r) => {
        if (filter === "pass") return r.status === "pass";
        if (filter === "fail") return r.status === "fail";
        return true;
    });

    if (results.length === 0 && !loading && !error) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
            {/* Results Header & Actions */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">
                        {t("title")}
                    </h2>
                    <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 rounded-2xl text-zinc-500 dark:text-zinc-400 font-black text-xs shadow-inner">
                        {results.length} {t("sessions")}
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <ExportActions results={results} testCases={testCases} />
                    <div className="w-full sm:w-auto flex bg-zinc-100 dark:bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                        {(["all", "pass", "fail"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "flex-1 sm:flex-none px-6 py-2.5 rounded-xl transition-all duration-300",
                                    filter === f
                                        ? (f === "all" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-lg" : f === "pass" ? "bg-emerald-500 text-white shadow-lg" : "bg-red-500 text-white shadow-lg")
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                {t(f)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Performance Ribbon */}
            {loading && (
                <div className="rounded-[2rem] border border-teal-200 bg-teal-50/80 px-6 py-5 dark:border-teal-500/20 dark:bg-teal-500/10">
                    <div className="flex items-center gap-3 text-sm font-semibold text-teal-700 dark:text-teal-300">
                        <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                        Running evaluation across your test cases
                    </div>
                    <div className="mt-4 flex gap-3">
                        <div className="h-2 w-24 rounded-full bg-teal-200/80 dark:bg-teal-500/20 animate-pulse" />
                        <div className="h-2 w-36 rounded-full bg-teal-200/60 dark:bg-teal-500/10 animate-pulse" />
                    </div>
                </div>
            )}

            {results.length > 0 && (
            <div className="flex flex-wrap gap-4">
                {[
                    { label: t("avgSimilarity"), value: `${averageSimilarity.toFixed(1)}%`, color: "blue" },
                    { label: t("avgSemantic"), value: `${averageSemantic.toFixed(1)}%`, color: "teal" },
                    { label: t("passRate"), value: `${passPercentage.toFixed(0)}%`, sub: `(${passCount}/${results.length})`, color: "emerald" },
                    { label: "Format pass rate", value: validationEnabledCount > 0 ? `${validationPassRate.toFixed(0)}%` : "N/A", sub: validationEnabledCount > 0 ? `(${validationPassCount}/${validationEnabledCount})` : undefined, color: "violet" },
                    { label: t("avgLatency"), value: `${(avgLatency / 1000).toFixed(2)}s`, color: "purple" },
                    { label: t("totalCost"), value: formatCost(totalCost), color: "amber" },
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "min-w-[180px] flex-1 p-6 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] bg-white dark:bg-zinc-900 shadow-xl relative overflow-hidden group",
                        stat.color === 'blue' && "border-blue-200 dark:border-blue-900/50 hover:border-blue-400",
                        stat.color === 'teal' && "border-teal-200 dark:border-teal-900/50 hover:border-teal-400",
                        stat.color === 'emerald' && "border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400",
                        stat.color === 'violet' && "border-violet-200 dark:border-violet-900/50 hover:border-violet-400",
                        stat.color === 'purple' && "border-purple-200 dark:border-purple-900/50 hover:border-purple-400",
                        stat.color === 'amber' && "border-amber-200 dark:border-amber-900/50 hover:border-amber-400"
                    )}>
                        <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity",
                            stat.color === 'blue' && "bg-blue-500",
                            stat.color === 'teal' && "bg-teal-500",
                            stat.color === 'emerald' && "bg-emerald-500",
                            stat.color === 'violet' && "bg-violet-500",
                            stat.color === 'purple' && "bg-purple-500",
                            stat.color === 'amber' && "bg-amber-500"
                        )} />
                        <span className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-[0.2em] block mb-2">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className={cn(
                                "text-2xl md:text-3xl font-black font-mono tracking-tighter",
                                stat.color === 'blue' && "text-blue-600 dark:text-blue-400",
                                stat.color === 'teal' && "text-teal-600 dark:text-teal-400",
                                stat.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
                                stat.color === 'violet' && "text-violet-600 dark:text-violet-400",
                                stat.color === 'purple' && "text-purple-600 dark:text-purple-400",
                                stat.color === 'amber' && "text-amber-600 dark:text-amber-400"
                            )}>{stat.value}</span>
                            {stat.sub && <span className="text-[10px] font-bold text-zinc-400">{stat.sub}</span>}
                        </div>
                    </div>
                ))}
            </div>
            )}

            {results.length > 0 && (
            <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-black">
                                <th className="p-6 pl-8 w-20 whitespace-nowrap"># {t("table.id")}</th>
                                <th className="p-6 w-40 whitespace-nowrap">{t("table.status")}</th>
                                <th className="p-6 w-32 whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        {t("table.similarity")}
                                        <Info
                                            size={14}
                                            className="text-zinc-400 dark:text-zinc-600 cursor-help transition-colors hover:text-teal-500"
                                            data-tooltip-id="main-tooltip"
                                            data-tooltip-content={tm("similarity.description")}
                                        />
                                    </div>
                                </th>
                                <th className="p-6 w-32 whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        {t("table.semantic")}
                                        <Info
                                            size={14}
                                            className="text-zinc-400 dark:text-zinc-600 cursor-help transition-colors hover:text-teal-500"
                                            data-tooltip-id="main-tooltip"
                                            data-tooltip-content={tm("semantic.description")}
                                        />
                                    </div>
                                </th>
                                <th className="p-6 w-32 whitespace-nowrap">{t("latency")}</th>
                                <th className="p-6 w-32 whitespace-nowrap">{t("cost")}</th>
                                <th className="p-6 w-48 whitespace-nowrap">Format validation</th>
                                <th className="p-6 whitespace-nowrap">{t("table.output")}</th>
                                <th className="p-6 pr-8 whitespace-nowrap">{t("table.expected")}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">

                            {loading && results.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="p-12 text-center text-zinc-500 animate-pulse font-medium">
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
            )}
        </div>
    );
}
