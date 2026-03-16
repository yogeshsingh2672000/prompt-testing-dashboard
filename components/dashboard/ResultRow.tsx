"use client";

import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { EvaluationResult, TestCase } from "@/types";
import { cn } from "@/lib/utils";
import { CopyButton } from "../ui/CopyButton";

interface ResultRowProps {
    result: EvaluationResult;
    testCases: TestCase[];
}

export const ResultRow = React.memo(({ result, testCases }: ResultRowProps) => {
    const originalIndex = testCases.findIndex(tc => tc.id === result.testCaseId) + 1;
    const expectedOutput = testCases.find(tc => tc.id === result.testCaseId)?.expectedOutput || "";

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
                    {result.status}
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
            <td className="p-6 max-w-xs xl:max-w-xl relative group/cell">
                <div className="line-clamp-2 text-zinc-600 dark:text-zinc-300 font-medium text-sm leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    {result.response}
                    {result.error && <span className="text-red-600 dark:text-red-400 font-bold ml-2 underline decoration-red-500/30">Error: {result.error}</span>}
                </div>
                {/* Tooltip Overlay */}
                <div className="absolute left-6 top-0 z-50 invisible group-hover/cell:visible bg-white dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-700/50 p-6 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] w-[400px] md:w-[600px] max-h-[400px] overflow-y-auto text-zinc-800 dark:text-zinc-200 text-sm whitespace-pre-wrap -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 transition-all duration-300 backdrop-blur-2xl ring-1 ring-zinc-200 dark:ring-white/10 pointer-events-auto cursor-default">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-black tracking-[0.3em]">LLM Generation</div>
                        <CopyButton text={result.response} />
                    </div>
                    <div className="leading-relaxed font-medium highlight-text">
                        {result.response}
                    </div>
                </div>
            </td>
            <td className="p-6 pr-8 text-zinc-400 dark:text-zinc-500 italic max-w-xs xl:max-w-md relative group/expected">
                <div className="line-clamp-2 overflow-hidden text-ellipsis font-medium text-sm leading-relaxed text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                    {expectedOutput}
                </div>
                {/* Tooltip for Expected Output */}
                <div className="absolute right-8 top-0 z-50 invisible group-hover/expected:visible bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-700/50 p-6 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] w-[400px] md:w-[600px] max-h-[400px] overflow-y-auto text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-wrap -translate-y-1/2 opacity-0 group-hover/expected:opacity-100 transition-all duration-300 backdrop-blur-2xl ring-1 ring-zinc-200 dark:ring-white/10 pointer-events-auto cursor-default">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div className="text-[10px] uppercase text-zinc-400 dark:text-zinc-600 font-black tracking-[0.3em]">Gold Standard</div>
                        <CopyButton text={expectedOutput} />
                    </div>
                    <div className="leading-relaxed font-medium">
                        {expectedOutput}
                    </div>
                </div>
            </td>
        </tr>
    );
});

ResultRow.displayName = "ResultRow";
