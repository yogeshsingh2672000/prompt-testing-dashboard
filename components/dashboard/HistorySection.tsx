"use client";

import { useEffect, useState } from "react";
import { History, Trash2, Clock, ChevronRight, BarChart3 } from "lucide-react";
import { persistence, TestRun } from "@/lib/persistence";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface HistorySectionProps {
    onLoadRun: (run: TestRun) => void;
    activeRunId?: string;
}

export function HistorySection({ onLoadRun, activeRunId }: HistorySectionProps) {
    const t = useTranslations("history");
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        setLoading(true);
        const savedRuns = await persistence.getRuns();
        // Sort by timestamp descending
        setRuns(savedRuns.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
    };

    useEffect(() => {
        loadHistory();

        // Listen for new runs being saved (we can use a custom event or just refresh every now and then)
        // For now, let's just refresh when the evaluation starts/ends in a real app you'd use a shared state or event bus
    }, []);

    const deleteRun = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await persistence.deleteRun(id);
        loadHistory();
    };

    if (runs.length === 0 && !loading) return null;

    return (
        <div className="lg:col-span-12 xl:col-span-12">
            <div className="bg-white/70 dark:bg-zinc-900/40 p-6 md:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl shadow-xl transition-all duration-500 overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                            <History size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{t("title")}</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">{t("subtitle")}</p>
                        </div>
                    </div>
                    <button
                        onClick={loadHistory}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-teal-500 transition-colors"
                    >
                        {t("refresh")}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
                        ))
                    ) : (
                        runs.map((run) => (
                            <div
                                key={run.id}
                                onClick={() => onLoadRun(run)}
                                className={cn(
                                    "relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer group/item overflow-hidden",
                                    activeRunId === run.id
                                        ? "bg-teal-500/10 border-teal-500/30 ring-1 ring-teal-500/20"
                                        : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:border-teal-500/30 hover:shadow-2xl"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-black text-sm">
                                            {run.name}
                                            {activeRunId === run.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                                            <Clock size={10} />
                                            {new Date(run.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => deleteRun(run.id, e)}
                                        className="p-2 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/item:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <div className="space-y-1">
                                        <div className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest">{t("similarity")}</div>
                                        <div className="text-xs font-mono font-black text-zinc-600 dark:text-zinc-400">{run.metrics.avgSimilarity.toFixed(1)}%</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[8px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest">{t("passRate")}</div>
                                        <div className="text-xs font-mono font-black text-teal-600 dark:text-teal-400">{run.metrics.passRate.toFixed(0)}%</div>
                                    </div>
                                </div>

                                <div className="absolute top-1/2 right-4 -translate-y-1/2 transition-transform duration-300 group-hover/item:translate-x-1">
                                    <ChevronRight size={18} className="text-zinc-200 dark:text-zinc-800 group-hover/item:text-teal-500/50" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
