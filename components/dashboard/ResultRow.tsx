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
        <tr className="border-b border-zinc-800/50 hover:bg-white/[0.02] group transition-colors relative">
            <td className="p-4 pl-6 font-mono text-xs text-zinc-500">
                {originalIndex}
            </td>
            <td className="p-4">
                <div className={cn(
                    "flex items-center gap-2 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                    result.status === "pass" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"
                )}>
                    {result.status === "pass" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {result.status}
                </div>
            </td>
            <td className="p-4 text-center">
                <div className="font-mono text-xs font-medium text-zinc-500">
                    {result?.similarity?.toFixed(1)}%
                </div>
            </td>
            <td className="p-4 text-center">
                <div className="font-mono text-xs font-bold bg-teal-500/5 text-teal-400/80 w-fit px-2 py-1 rounded border border-teal-500/20 mx-auto shadow-[0_0_10px_rgba(45,212,191,0.05)]">
                    {result?.semanticScore?.toFixed(0)}%
                </div>
            </td>
            <td className="p-4 max-w-xs xl:max-w-md relative group/cell">
                <div className="line-clamp-2 text-zinc-300">
                    {result.response}
                    {result.error && <span className="text-red-400 italic">Error: {result.error}</span>}
                </div>
                {/* Tooltip Overlay */}
                <div className="absolute left-0 top-0 z-50 invisible group-hover/cell:visible bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-2xl w-[400px] max-h-[300px] overflow-y-auto text-zinc-200 text-sm whitespace-pre-wrap -translate-y-[20%] opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-auto cursor-default">
                    <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-1">
                        <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">LLM Response</div>
                        <CopyButton text={result.response} />
                    </div>
                    {result.response}
                </div>
            </td>
            <td className="p-4 pr-6 text-zinc-500 italic max-w-xs relative group/expected">
                <div className="line-clamp-2 overflow-hidden text-ellipsis">
                    {expectedOutput}
                </div>
                {/* Tooltip for Expected Output */}
                <div className="absolute right-0 top-0 z-50 invisible group-hover/expected:visible bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-2xl w-[400px] max-h-[300px] overflow-y-auto text-zinc-400 text-sm whitespace-pre-wrap -translate-y-[20%] opacity-0 group-hover/expected:opacity-100 transition-opacity pointer-events-auto cursor-default">
                    <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-1">
                        <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Expected Output</div>
                        <CopyButton text={expectedOutput} />
                    </div>
                    {expectedOutput}
                </div>
            </td>
        </tr>
    );
});

ResultRow.displayName = "ResultRow";
