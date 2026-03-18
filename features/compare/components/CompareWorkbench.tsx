"use client";

import { GitCompareArrows, Loader2, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import {
    ComparisonCaseResult,
    ComparisonMetricsSummary,
    EvaluationRequest,
    EvaluationResult,
} from "@/shared/types";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";
import { cn, formatCost } from "@/shared/lib/utils";

interface ComparisonRunState {
    leftResults: EvaluationResult[];
    rightResults: EvaluationResult[];
    summary: {
        left: ComparisonMetricsSummary;
        right: ComparisonMetricsSummary;
    };
    cases: ComparisonCaseResult[];
}

const CURRENT_WORKSPACE_DATASET_ID = "__current_workspace__";

function summarizeResults(results: EvaluationResult[]): ComparisonMetricsSummary {
    if (results.length === 0) {
        return {
            avgSimilarity: 0,
            avgSemanticScore: 0,
            passRate: 0,
            totalCostUsd: 0,
            avgLatencyMs: 0,
        };
    }

    const passCount = results.filter((result) => result.status === "pass").length;

    return {
        avgSimilarity: results.reduce((sum, result) => sum + result.similarity, 0) / results.length,
        avgSemanticScore: results.reduce((sum, result) => sum + result.semanticScore, 0) / results.length,
        passRate: (passCount / results.length) * 100,
        totalCostUsd: results.reduce((sum, result) => sum + result.metrics.costUsd, 0),
        avgLatencyMs: results.reduce((sum, result) => sum + result.metrics.latencyMs, 0) / results.length,
    };
}

export function CompareWorkbench() {
    const { promptVersions, suites, testCases, pushToast } = useDashboardWorkspace();
    const [leftVersionId, setLeftVersionId] = useState<string>("");
    const [rightVersionId, setRightVersionId] = useState<string>("");
    const [datasetId, setDatasetId] = useState<string>(CURRENT_WORKSPACE_DATASET_ID);
    const [loading, setLoading] = useState(false);
    const [comparison, setComparison] = useState<ComparisonRunState | null>(null);

    const leftVersion = useMemo(
        () => promptVersions.find((version) => version.id === leftVersionId),
        [leftVersionId, promptVersions]
    );
    const rightVersion = useMemo(
        () => promptVersions.find((version) => version.id === rightVersionId),
        [rightVersionId, promptVersions]
    );

    const selectedDataset = useMemo(() => {
        if (datasetId === CURRENT_WORKSPACE_DATASET_ID) {
            return {
                id: CURRENT_WORKSPACE_DATASET_ID,
                name: "Current workspace",
                testCases,
            };
        }

        return suites.find((suite) => suite.id === datasetId) || null;
    }, [datasetId, suites, testCases]);

    const runComparison = async () => {
        if (!leftVersion || !rightVersion) {
            pushToast({
                title: "Comparison setup incomplete",
                message: "Choose two saved prompt versions to compare.",
                variant: "error",
            });
            return;
        }

        if (leftVersion.id === rightVersion.id) {
            pushToast({
                title: "Choose two different versions",
                message: "A/B comparison needs two distinct prompt versions.",
                variant: "error",
            });
            return;
        }

        if (!selectedDataset || selectedDataset.testCases.length === 0) {
            pushToast({
                title: "Dataset required",
                message: "Select a dataset with at least one test case.",
                variant: "error",
            });
            return;
        }

        const makeRequest = (version: typeof leftVersion): EvaluationRequest => ({
            systemPrompt: version.systemPrompt,
            userInput: version.userInput,
            testCases: selectedDataset.testCases,
            batchSize: version.batchSize,
            threshold: version.threshold,
            modelId: version.modelId,
        });

        setLoading(true);
        setComparison(null);

        try {
            const [leftResponse, rightResponse] = await Promise.all([
                fetch("/api/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(makeRequest(leftVersion)),
                }),
                fetch("/api/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(makeRequest(rightVersion)),
                }),
            ]);

            const [leftPayload, rightPayload] = await Promise.all([leftResponse.json(), rightResponse.json()]);

            if (!leftResponse.ok) {
                throw new Error(typeof leftPayload?.error === "string" ? leftPayload.error : "Left comparison run failed");
            }

            if (!rightResponse.ok) {
                throw new Error(typeof rightPayload?.error === "string" ? rightPayload.error : "Right comparison run failed");
            }

            const leftResults = leftPayload as EvaluationResult[];
            const rightResults = rightPayload as EvaluationResult[];
            const rightResultsMap = new Map(rightResults.map((result) => [result.testCaseId, result]));

            const cases: ComparisonCaseResult[] = selectedDataset.testCases.map((testCase) => {
                const left = leftResults.find((result) => result.testCaseId === testCase.id) || {
                    testCaseId: testCase.id,
                    response: "",
                    similarity: 0,
                    semanticScore: 0,
                    status: "fail" as const,
                    metrics: { latencyMs: 0, tokens: { prompt: 0, completion: 0, total: 0 }, costUsd: 0 },
                };

                const right = rightResultsMap.get(testCase.id) || {
                    testCaseId: testCase.id,
                    response: "",
                    similarity: 0,
                    semanticScore: 0,
                    status: "fail" as const,
                    metrics: { latencyMs: 0, tokens: { prompt: 0, completion: 0, total: 0 }, costUsd: 0 },
                };

                const semanticDelta = left.semanticScore - right.semanticScore;
                const similarityDelta = left.similarity - right.similarity;
                const winner =
                    semanticDelta === 0
                        ? similarityDelta === 0
                            ? "tie"
                            : similarityDelta > 0
                                ? "left"
                                : "right"
                        : semanticDelta > 0
                            ? "left"
                            : "right";

                return {
                    testCaseId: testCase.id,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    left,
                    right,
                    semanticDelta,
                    similarityDelta,
                    winner,
                };
            });

            setComparison({
                leftResults,
                rightResults,
                summary: {
                    left: summarizeResults(leftResults),
                    right: summarizeResults(rightResults),
                },
                cases,
            });

            pushToast({
                title: "Comparison complete",
                message: `Compared "${leftVersion.name}" against "${rightVersion.name}" on ${selectedDataset.testCases.length} cases.`,
                variant: "success",
            });
        } catch (error) {
            pushToast({
                title: "Comparison failed",
                message: error instanceof Error ? error.message : "Unable to complete comparison.",
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Compare"
                title="Run true A/B prompt comparisons"
                description="Select two saved prompt versions, evaluate them against the same dataset, and inspect both the aggregate deltas and the per-case winners."
            />

            <SurfaceCard className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Version A</label>
                        <select
                            value={leftVersionId}
                            onChange={(event) => setLeftVersionId(event.target.value)}
                            className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                            <option value="">Select a prompt version</option>
                            {promptVersions.map((version) => (
                                <option key={version.id} value={version.id}>
                                    {version.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Version B</label>
                        <select
                            value={rightVersionId}
                            onChange={(event) => setRightVersionId(event.target.value)}
                            className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                            <option value="">Select a prompt version</option>
                            {promptVersions.map((version) => (
                                <option key={version.id} value={version.id}>
                                    {version.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">Dataset</label>
                        <select
                            value={datasetId}
                            onChange={(event) => setDatasetId(event.target.value)}
                            className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                            <option value={CURRENT_WORKSPACE_DATASET_ID}>Current workspace ({testCases.length} cases)</option>
                            {suites.map((suite) => (
                                <option key={suite.id} value={suite.id}>
                                    {suite.name} ({suite.testCases.length} cases)
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={runComparison}
                        disabled={loading || promptVersions.length < 2}
                        className="inline-flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <GitCompareArrows size={16} />}
                        {loading ? "Comparing..." : "Run Comparison"}
                    </button>
                </div>

                {promptVersions.length < 2 && (
                    <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-5 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        Save at least two prompt versions from the workspace before using A/B comparison.
                    </div>
                )}
            </SurfaceCard>

            {comparison && leftVersion && rightVersion && (
                <>
                    <div className="grid gap-6 xl:grid-cols-2">
                        {([
                            { label: leftVersion.name, tone: "teal", summary: comparison.summary.left },
                            { label: rightVersion.name, tone: "blue", summary: comparison.summary.right },
                        ] as const).map((entry) => (
                            <SurfaceCard key={entry.label} className="space-y-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="section-kicker">{entry.tone === "teal" ? "Version A" : "Version B"}</div>
                                        <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">{entry.label}</h3>
                                    </div>
                                    <Trophy size={18} className={cn(entry.tone === "teal" ? "text-teal-500" : "text-blue-500")} />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <MetricPill label="Pass Rate" value={`${entry.summary.passRate.toFixed(0)}%`} tone={entry.tone} />
                                    <MetricPill label="Avg Semantic" value={`${entry.summary.avgSemanticScore.toFixed(1)}%`} tone={entry.tone} />
                                    <MetricPill label="Avg Similarity" value={`${entry.summary.avgSimilarity.toFixed(1)}%`} tone={entry.tone} />
                                    <MetricPill label="Avg Latency" value={`${(entry.summary.avgLatencyMs / 1000).toFixed(2)}s`} tone={entry.tone} />
                                    <MetricPill label="Total Cost" value={formatCost(entry.summary.totalCostUsd)} tone={entry.tone} />
                                </div>
                            </SurfaceCard>
                        ))}
                    </div>

                    <SurfaceCard className="space-y-5">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <div className="section-kicker">Case Winners</div>
                                <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Per-case comparison</h3>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    Semantic score is used as the primary winner signal, with similarity as the tiebreaker.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-[980px] w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                                        <th className="px-4 py-4">Case</th>
                                        <th className="px-4 py-4">Winner</th>
                                        <th className="px-4 py-4">{leftVersion.name}</th>
                                        <th className="px-4 py-4">{rightVersion.name}</th>
                                        <th className="px-4 py-4">Delta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.cases.map((caseResult, index) => (
                                        <tr key={caseResult.testCaseId} className="border-b border-zinc-100 align-top text-sm dark:border-zinc-900">
                                            <td className="px-4 py-4">
                                                <div className="font-black text-zinc-900 dark:text-white">#{index + 1}</div>
                                                <div className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                                    {caseResult.input || "No input provided"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]",
                                                        caseResult.winner === "left" && "bg-teal-500/10 text-teal-600 dark:text-teal-300",
                                                        caseResult.winner === "right" && "bg-blue-500/10 text-blue-600 dark:text-blue-300",
                                                        caseResult.winner === "tie" && "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                                    )}
                                                >
                                                    {caseResult.winner === "left" ? "Version A" : caseResult.winner === "right" ? "Version B" : "Tie"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <ComparisonScoreBlock result={caseResult.left} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <ComparisonScoreBlock result={caseResult.right} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-black text-zinc-900 dark:text-white">
                                                    {caseResult.semanticDelta > 0 ? "+" : ""}
                                                    {caseResult.semanticDelta.toFixed(1)} semantic
                                                </div>
                                                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                    {caseResult.similarityDelta > 0 ? "+" : ""}
                                                    {caseResult.similarityDelta.toFixed(1)} similarity
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SurfaceCard>
                </>
            )}
        </div>
    );
}

function MetricPill({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: "teal" | "blue";
}) {
    return (
        <div
            className={cn(
                "rounded-[1.5rem] border px-4 py-4",
                tone === "teal" ? "border-teal-500/20 bg-teal-500/8" : "border-blue-500/20 bg-blue-500/8"
            )}
        >
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">{label}</div>
            <div className={cn("mt-2 text-2xl font-black tracking-tight", tone === "teal" ? "text-teal-600 dark:text-teal-300" : "text-blue-600 dark:text-blue-300")}>
                {value}
            </div>
        </div>
    );
}

function ComparisonScoreBlock({ result }: { result: EvaluationResult }) {
    return (
        <div className="space-y-1">
            <div className="font-black text-zinc-900 dark:text-white">{result.semanticScore.toFixed(1)}% semantic</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{result.similarity.toFixed(1)}% similarity</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {(result.metrics.latencyMs / 1000).toFixed(2)}s | {formatCost(result.metrics.costUsd)}
            </div>
        </div>
    );
}
