"use client";

import { Trash2, Clock, ChevronRight, Download } from "lucide-react";
import { useSavedRuns } from "@/features/runs/hooks/useSavedRuns";
import { persistence, TestRun } from "@/shared/lib/persistence";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { downloadFile } from "@/shared/lib/export";
import { buildRunReportHtml, buildRunReportMarkdown } from "@/shared/lib/report";

interface HistorySectionProps {
    onLoadRun: (run: TestRun) => void;
    activeRunId?: string;
}

export function HistorySection({ onLoadRun, activeRunId }: HistorySectionProps) {
    const t = useTranslations("history");
    const { runs, loading, loadRuns: loadHistory } = useSavedRuns();

    const deleteRun = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await persistence.deleteRun(id);
        window.dispatchEvent(new CustomEvent("promitly:runs-updated"));
    };

    const exportRunReport = (run: TestRun, format: "html" | "md", e: React.MouseEvent) => {
        e.stopPropagation();
        const fileSafeName = run.name.replace(/\s+/g, "-").toLowerCase() || "run-report";

        if (format === "html") {
            downloadFile(buildRunReportHtml(run), `${fileSafeName}.html`, "text/html;charset=utf-8");
            return;
        }

        downloadFile(buildRunReportMarkdown(run), `${fileSafeName}.md`, "text/markdown;charset=utf-8");
    };

    if (runs.length === 0 && !loading) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 opacity-50" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div className="space-y-1">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 flex items-center gap-3">
                            <Clock size={16} className="text-amber-500" /> {t("experimentArchive")}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 italic">{t("historicalRuns")}</span>
                             <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-0.5 rounded-full text-[10px] font-black shadow-lg">
                                {runs.length} {t("records")}
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={loadHistory}
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700"
                    >
                        {t("refresh")}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-40 rounded-3xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
                        ))
                    ) : (
                        runs.map((run, index) => (
                            <div
                                key={run.id}
                                onClick={() => onLoadRun(run)}
                                className={cn(
                                    "relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer group/item overflow-hidden hover:scale-[1.03]",
                                    activeRunId === run.id
                                        ? "bg-zinc-900 text-white border-transparent shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ring-4 ring-teal-500/20"
                                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/50 hover:border-teal-500/30 hover:shadow-2xl"
                                )}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className={cn(
                                            "font-black text-lg tracking-tight italic flex items-center gap-2",
                                            activeRunId === run.id ? "text-white" : "text-zinc-900 dark:text-zinc-100"
                                        )}>
                                            {run.name}
                                            {activeRunId === run.id && (
                                                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="text-[9px] font-black uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                                            <Clock size={10} /> {new Date(run.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => exportRunReport(run, "html", e)}
                                            className={cn(
                                                "p-2 rounded-xl transition-all hover:bg-blue-500/10 hover:text-blue-500",
                                                activeRunId === run.id ? "text-zinc-500" : "text-zinc-300"
                                            )}
                                            title="Export HTML report"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => deleteRun(run.id, e)}
                                            className={cn(
                                                "p-2 rounded-xl transition-all hover:bg-red-500/10 hover:text-red-500",
                                                activeRunId === run.id ? "text-zinc-500" : "text-zinc-300"
                                            )}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className={cn(
                                    "grid grid-cols-3 gap-4 pt-6 border-t",
                                    activeRunId === run.id ? "border-white/10" : "border-zinc-100 dark:border-zinc-800"
                                )}>
                                    <div>
                                        <div className="text-[8px] uppercase font-black opacity-40 mb-1 tracking-widest">{t("similarity")}</div>
                                        <div className={cn(
                                            "text-lg font-black font-mono tracking-tighter",
                                            activeRunId === run.id ? "text-teal-400" : "text-zinc-600 dark:text-zinc-400"
                                        )}>{run.metrics.avgSimilarity.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] uppercase font-black opacity-40 mb-1 tracking-widest">{t("passRate")}</div>
                                        <div className={cn(
                                            "text-lg font-black font-mono tracking-tighter",
                                            activeRunId === run.id ? "text-emerald-400" : "text-emerald-500"
                                        )}>{run.metrics.passRate.toFixed(0)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] uppercase font-black opacity-40 mb-1 tracking-widest">reviews</div>
                                        <div className={cn(
                                            "text-lg font-black font-mono tracking-tighter",
                                            activeRunId === run.id ? "text-rose-300" : "text-rose-500"
                                        )}>{Object.keys(run.reviews || {}).length}</div>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover/item:opacity-100 transition-all duration-300 translate-x-4 group-hover/item:translate-x-0">
                                    <ChevronRight size={20} className={activeRunId === run.id ? "text-teal-400" : "text-teal-500"} />
                                </div>
                            </div>
                        ))
                    )}

                    {!loading && runs.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] opacity-30">
                            <Clock size={40} className="mb-4" />
                            <p className="font-black uppercase tracking-widest text-sm text-zinc-500">No records found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
