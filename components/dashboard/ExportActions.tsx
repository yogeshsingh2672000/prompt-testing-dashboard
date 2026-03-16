"use client";

import React from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { EvaluationResult, TestCase } from '@/types';
import { resultsToCSV, downloadFile } from '@/lib/export';

interface ExportActionsProps {
    results: EvaluationResult[];
    testCases: TestCase[];
}

export function ExportActions({ results, testCases }: ExportActionsProps) {
    const handleExportCSV = () => {
        const csv = resultsToCSV(results, testCases);
        const date = new Date().toISOString().split('T')[0];
        downloadFile(csv, `promitly_results_${date}.csv`, "text/csv;charset=utf-8;");
    };

    const handleExportJSON = () => {
        const data = JSON.stringify({
            timestamp: new Date().toISOString(),
            results,
            testCases
        }, null, 2);
        const date = new Date().toISOString().split('T')[0];
        downloadFile(data, `promitly_results_${date}.json`, "application/json");
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
                title="Export as CSV"
            >
                <FileSpreadsheet size={14} />
                CSV
            </button>
            <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
                title="Export as JSON"
            >
                <FileJson size={14} />
                JSON
            </button>
        </div>
    );
}
