"use client";

import { Activity, AlertTriangle, BarChart3, BrainCircuit, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useSavedRuns } from "@/features/runs/hooks/useSavedRuns";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import {
    buildModelLeaderboard,
    buildRegressionSummary,
    buildRubricAnalytics,
    buildTrendPoints,
    findBaselineRun,
    resolveBaselinePromptVersionId,
} from "@/shared/lib/run-analytics";
import { formatCost } from "@/shared/lib/utils";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

export function AnalyticsHubView() {
    const { runs, loading } = useSavedRuns();
    const { settings, promptVersions } = useDashboardWorkspace();

    const trendPoints = useMemo(() => buildTrendPoints(runs), [runs]);
    const rubricAnalytics = useMemo(() => buildRubricAnalytics(runs), [runs]);
    const leaderboard = useMemo(() => buildModelLeaderboard(runs), [runs]);

    const recentRegressions = useMemo(() => {
        return runs.slice(0, 6).map((run) => {
            const baselinePromptVersionId = resolveBaselinePromptVersionId(
                run.suiteId,
                promptVersions,
                settings.globalBaselinePromptVersionId,
                settings.baselinePromptVersionIdsBySuite
            );
            const baselineRun = findBaselineRun(runs, run, baselinePromptVersionId);
            return {
                run,
                summary: buildRegressionSummary(run, baselineRun),
            };
        });
    }, [promptVersions, runs, settings]);

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Analytics"
                title="Track quality trends, regressions, and model performance"
                description="Promitly now treats saved runs as a quality history, not just an archive. Use this view to follow trend lines, inspect rubric pressure points, and catch regressions against approved baselines."
            />

            {loading ? (
                <div className="grid gap-6 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-40 animate-pulse rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50" />
                    ))}
                </div>
            ) : runs.length === 0 ? (
                <SurfaceCard className="rounded-[2rem] border-dashed text-sm text-zinc-500 dark:text-zinc-400">
                    Run a few evaluations first. Analytics will appear here once Promitly has history to compare.
                </SurfaceCard>
            ) : (
                <>
                    <div className="grid gap-6 xl:grid-cols-4">
                        <MetricCard label="Saved runs" value={String(runs.length)} icon={<Activity size={16} className="text-teal-500" />} />
                        <MetricCard label="Trend points" value={String(trendPoints.length)} icon={<BarChart3 size={16} className="text-blue-500" />} />
                        <MetricCard label="Rubrics tracked" value={String(rubricAnalytics.length)} icon={<BrainCircuit size={16} className="text-fuchsia-500" />} />
                        <MetricCard label="Models compared" value={String(leaderboard.length)} icon={<Trophy size={16} className="text-amber-500" />} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <SurfaceCard className="space-y-5">
                            <div>
                                <div className="section-kicker">Trendline</div>
                                <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Recent run quality trend</h3>
                            </div>
                            <div className="space-y-4">
                                {trendPoints.map((point) => (
                                    <div key={point.timestamp} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                                            <span>{point.label}</span>
                                            <span>{point.passRate.toFixed(0)}% pass</span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500" style={{ width: `${Math.max(point.avgOverall, 3)}%` }} />
                                        </div>
                                        <div className="grid gap-3 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-4">
                                            <span>Overall {point.avgOverall.toFixed(1)}%</span>
                                            <span>Semantic {point.avgSemantic.toFixed(1)}%</span>
                                            <span>Latency {(point.avgLatencyMs / 1000).toFixed(2)}s</span>
                                            <span>Cost {formatCost(point.totalCostUsd)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SurfaceCard>

                        <SurfaceCard className="space-y-5">
                            <div>
                                <div className="section-kicker">Rubrics</div>
                                <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Average rubric performance</h3>
                            </div>
                            <div className="space-y-3">
                                {rubricAnalytics.map((rubric) => (
                                    <div key={rubric.rubricId} className="rounded-[1.5rem] border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-black text-zinc-900 dark:text-white">{rubric.name}</div>
                                                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{rubric.sampleCount} rubric judgments</div>
                                            </div>
                                            <div className="text-2xl font-black tracking-tight text-fuchsia-500">{rubric.averageScore.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SurfaceCard>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <SurfaceCard className="space-y-5">
                            <div>
                                <div className="section-kicker">Leaderboard</div>
                                <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Model performance ranking</h3>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.modelId} className="rounded-[1.5rem] border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Rank #{index + 1}</div>
                                                <div className="mt-2 text-sm font-black text-zinc-900 dark:text-white">{entry.modelId}</div>
                                                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{entry.runCount} runs compared</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black tracking-tight text-amber-500">{entry.avgOverall.toFixed(1)}%</div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{entry.passRate.toFixed(0)}% pass</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SurfaceCard>

                        <SurfaceCard className="space-y-5">
                            <div>
                                <div className="section-kicker">Regressions</div>
                                <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Recent baseline comparisons</h3>
                            </div>
                            <div className="space-y-3">
                                {recentRegressions.map(({ run, summary }) => (
                                    <div key={run.id} className="rounded-[1.5rem] border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-sm font-black text-zinc-900 dark:text-white">{run.name}</div>
                                                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                    {summary.hasBaseline ? "Compared with nearest baseline run" : "No baseline linked yet"}
                                                </div>
                                            </div>
                                            <AlertTriangle size={16} className={summary.hasBaseline && summary.passRateDelta < 0 ? "text-rose-500" : "text-zinc-400"} />
                                        </div>
                                        {summary.hasBaseline ? (
                                            <div className="mt-4 grid gap-3 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
                                                <span>Pass rate {formatDelta(summary.passRateDelta, "%")}</span>
                                                <span>Overall {formatDelta(summary.avgOverallDelta, "%")}</span>
                                                <span>Latency {formatDelta(summary.avgLatencyDelta / 1000, "s")}</span>
                                                <span>New failures {summary.newlyFailingCases.length}</span>
                                            </div>
                                        ) : (
                                            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                                                Assign a global or suite baseline in Settings to unlock regression tracking here.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SurfaceCard>
                    </div>
                </>
            )}
        </div>
    );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <SurfaceCard className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="section-kicker">{label}</div>
                {icon}
            </div>
            <div className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">{value}</div>
        </SurfaceCard>
    );
}

function formatDelta(value: number, suffix: string) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}${suffix}`;
}
