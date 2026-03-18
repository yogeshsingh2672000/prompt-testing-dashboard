"use client";

import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { EvaluationResult, TestCase } from "@/shared/types";
import { cn, formatCost } from "@/shared/lib/utils";

interface ResultRowProps {
    result: EvaluationResult;
    testCases: TestCase[];
}

import { useTranslations } from "next-intl";

export const ResultRow = React.memo(({ result, testCases }: ResultRowProps) => {
    const t = useTranslations("results");
    const originalIndex = testCases.findIndex(tc => tc.id === result.testCaseId) + 1;
    const expectedOutput = testCases.find(tc => tc.id === result.testCaseId)?.expectedOutput || "";
    const validationTone = result.validation?.enabled
        ? result.validation.passed
            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30"
            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30"
        : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

    return (
        <tr className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-white/[0.03] group transition-all duration-300 relative">
            <td className="p-6 pl-8 font-mono text-xs font-black text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                {originalIndex.toString().padStart(2, "0")}
            </td>
            <td className="p-6">
                <div className={cn(
                    "flex items-center gap-3 w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg transition-all",
                    result.status === "pass" 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 group-hover:border-emerald-400 dark:group-hover:border-emerald-500/50 shadow-emerald-500/5" 
                        : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 group-hover:border-red-400 dark:group-hover:border-red-500/50 shadow-red-500/5"
                )}>
                    {result.status === "pass" ? <CheckCircle2 size={14} className="stroke-[3]" /> : <AlertCircle size={14} className="stroke-[3]" />}
                    {t(result.status)}
                </div>
            </td>
            <td className="p-6 text-center">
                <div className="font-mono text-sm font-black text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                    {result?.similarity?.toFixed(1)}%
                </div>
            </td>
            <td className="p-6 text-center">
                <div className="font-mono text-sm font-black bg-teal-50 dark:bg-teal-500/5 text-teal-600 dark:text-teal-400/80 w-fit px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-500/20 mx-auto shadow-xl group-hover:border-teal-400 dark:group-hover:border-teal-500/40 transition-all">
                    {result?.semanticScore?.toFixed(0)}%
                </div>
            </td>
            <td className="p-6 text-center">
                <div
                    className="mx-auto w-fit rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-1.5 font-mono text-sm font-black text-fuchsia-600 shadow-xl transition-all group-hover:border-fuchsia-400 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/5 dark:text-fuchsia-300"
                    data-tooltip-id="main-tooltip"
                    data-tooltip-html={`
                        <div class="space-y-3">
                            <div class="border-b border-zinc-100 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">Rubric breakdown</div>
                            ${result.rubricResults.length > 0
                                ? result.rubricResults.map((rubric) => `<div><div class="font-semibold text-zinc-900 dark:text-zinc-100">${rubric.name}: ${rubric.score.toFixed(0)}%</div><div class="text-xs text-zinc-500 dark:text-zinc-400">${rubric.reasoning}</div></div>`).join("")
                                : '<div class="text-xs text-zinc-500 dark:text-zinc-400">No rubrics enabled for this run.</div>'}
                        </div>
                    `}
                >
                    {result.rubricScore.toFixed(0)}%
                </div>
            </td>
            <td className="p-6 text-center">
                <div className="mx-auto w-fit rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-mono text-sm font-black text-indigo-600 shadow-xl transition-all group-hover:border-indigo-400 dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-300">
                    {result.overallScore.toFixed(0)}%
                </div>
            </td>
            <td className="p-6 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {(result.metrics?.latencyMs / 1000).toFixed(2)}s
            </td>
            <td className="p-6 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {formatCost(result.metrics?.costUsd || 0)}
            </td>
            <td className="p-6">
                <div
                    className={cn(
                        "w-fit max-w-[12rem] rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm",
                        validationTone
                    )}
                    data-tooltip-id="main-tooltip"
                    data-tooltip-content={result.validation?.message || "No structured validation configured."}
                >
                    {result.validation?.enabled
                        ? result.validation.passed
                            ? `Pass • ${result.validation.type}`
                            : `Fail • ${result.validation.type}`
                        : "Not configured"}
                </div>
            </td>
            <td className="p-6 max-w-xs xl:max-w-xl relative group/cell">
                <div 
                    className="line-clamp-2 text-zinc-600 dark:text-zinc-300 font-medium text-sm leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors cursor-help"
                    data-tooltip-id="main-tooltip"
                    data-tooltip-html={`
                        <div class="space-y-3">
                            <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
                                <span class="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-black tracking-widest">${t("table.generation")}</span>
                            </div>
                            <div class="leading-relaxed font-medium text-zinc-800 dark:text-zinc-200">
                                ${result.response.replace(/\n/g, '<br/>')}
                            </div>
                        </div>
                    `}
                >
                    {result.response}
                    {result.error && <span className="text-red-600 dark:text-red-400 font-bold ml-2 underline decoration-red-500/30">Error: {result.error}</span>}
                </div>
            </td>
            <td className="p-6 pr-8 text-zinc-400 dark:text-zinc-500 italic max-w-xs xl:max-w-md relative group/expected">
                <div 
                    className="line-clamp-2 overflow-hidden text-ellipsis font-medium text-sm leading-relaxed text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors cursor-help"
                    data-tooltip-id="main-tooltip"
                    data-tooltip-html={`
                        <div class="space-y-3">
                            <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
                                <span class="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-black tracking-widest">${t("table.goldStandard")}</span>
                            </div>
                            <div class="leading-relaxed font-medium text-zinc-800 dark:text-zinc-200">
                                ${expectedOutput.replace(/\n/g, '<br/>')}
                            </div>
                        </div>
                    `}
                >
                    {expectedOutput}
                </div>
            </td>
        </tr>
    );
});

ResultRow.displayName = "ResultRow";
