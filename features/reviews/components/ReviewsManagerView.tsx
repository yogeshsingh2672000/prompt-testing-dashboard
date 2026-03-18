"use client";

import { CheckCircle2, FileCheck2, MessageSquareText, RotateCcw, Search, ShieldAlert, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { persistence, TestRun } from "@/shared/lib/persistence";
import { CaseReview, EvaluationResult, TestCase } from "@/shared/types";
import { cn } from "@/shared/lib/utils";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

type ReviewFilter = "all" | "pending" | "approved" | "rejected";

function createReviewedTimestamp() {
    return Date.now();
}

function getReviewForResult(run: TestRun, result: EvaluationResult): CaseReview {
    return (
        run.reviews?.[result.testCaseId] || {
            testCaseId: result.testCaseId,
            decision: "pending",
            note: "",
            reviewedAt: 0,
        }
    );
}

function getReviewById(run: TestRun, testCaseId: string): CaseReview {
    return (
        run.reviews?.[testCaseId] || {
            testCaseId,
            decision: "pending",
            note: "",
            reviewedAt: 0,
        }
    );
}

function getEffectiveStatus(result: EvaluationResult, review: CaseReview): "pass" | "fail" {
    return review.overrideStatus || result.status;
}

function getTestCase(testCases: TestCase[], testCaseId: string) {
    return testCases.find((testCase) => testCase.id === testCaseId);
}

export function ReviewsManagerView() {
    const router = useRouter();
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [selectedRunId, setSelectedRunId] = useState<string>("");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<ReviewFilter>("all");
    const [loading, setLoading] = useState(true);
    const [savingReviewId, setSavingReviewId] = useState<string | null>(null);

    const loadRuns = async () => {
        setLoading(true);
        const savedRuns = await persistence.getRuns();
        const sortedRuns = savedRuns.sort((a, b) => b.timestamp - a.timestamp);
        setRuns(sortedRuns);
        setSelectedRunId((current) => current || sortedRuns[0]?.id || "");
        setLoading(false);
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadRuns();
        }, 0);

        const handleRunsUpdated = () => {
            void loadRuns();
        };

        window.addEventListener("promitly:runs-updated", handleRunsUpdated);
        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("promitly:runs-updated", handleRunsUpdated);
        };
    }, []);

    const selectedRun = useMemo(
        () => runs.find((run) => run.id === selectedRunId),
        [runs, selectedRunId]
    );

    const reviewedSummary = useMemo(() => {
        if (!selectedRun) {
            return { pending: 0, approved: 0, rejected: 0 };
        }

        return selectedRun.results.reduce(
            (summary, result) => {
                const review = getReviewForResult(selectedRun, result);
                summary[review.decision] += 1;
                return summary;
            },
            { pending: 0, approved: 0, rejected: 0 }
        );
    }, [selectedRun]);

    const filteredCases = useMemo(() => {
        if (!selectedRun) {
            return [];
        }

        return selectedRun.results.filter((result) => {
            const review = getReviewForResult(selectedRun, result);
            const testCase = getTestCase(selectedRun.testCases, result.testCaseId);
            const haystack = `${testCase?.input || ""} ${testCase?.expectedOutput || ""} ${result.response} ${review.note}`.toLowerCase();
            const matchesQuery = query.trim().length === 0 || haystack.includes(query.trim().toLowerCase());
            const matchesFilter = filter === "all" || review.decision === filter;
            return matchesQuery && matchesFilter;
        });
    }, [filter, query, selectedRun]);

    const saveReview = async (testCaseId: string, updates: Partial<CaseReview>) => {
        if (!selectedRun) {
            return;
        }

        setSavingReviewId(testCaseId);
        const currentReview = getReviewById(selectedRun, testCaseId);
        const nextReview: CaseReview = {
            ...currentReview,
            ...updates,
            testCaseId,
            reviewedAt: createReviewedTimestamp(),
        };

        const updatedRun: TestRun = {
            ...selectedRun,
            reviews: {
                ...(selectedRun.reviews || {}),
                [testCaseId]: nextReview,
            },
        };

        await persistence.saveRun(updatedRun);
        setRuns((current) => current.map((run) => (run.id === updatedRun.id ? updatedRun : run)));
        window.dispatchEvent(new CustomEvent("promitly:runs-updated"));
        setSavingReviewId(null);
    };

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Reviews"
                title="Add human judgment on top of automated evaluation"
                description="Review saved runs, approve or reject model behavior, leave notes for future prompt work, and optionally override pass or fail without losing the original machine score."
            />

            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <SurfaceCard className="space-y-5">
                    <div className="space-y-2">
                        <div className="section-kicker">Runs</div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Saved experiments</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Pick a run to inspect reviewer decisions case by case.</p>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-800/60" />
                            ))}
                        </div>
                    ) : runs.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                            No saved runs yet. Run an evaluation first, then come back here for human review.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {runs.map((run) => (
                                <button
                                    key={run.id}
                                    onClick={() => setSelectedRunId(run.id)}
                                    className={cn(
                                        "w-full rounded-[1.75rem] border px-4 py-4 text-left transition-all",
                                        selectedRunId === run.id
                                            ? "border-rose-500/40 bg-rose-500/10 shadow-lg"
                                            : "border-zinc-200 bg-white/70 hover:border-rose-400/40 dark:border-zinc-800 dark:bg-zinc-900/60"
                                    )}
                                >
                                    <div className="text-sm font-black text-zinc-900 dark:text-white">{run.name}</div>
                                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{new Date(run.timestamp).toLocaleString()}</div>
                                    <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                        <span>{run.results.length} cases</span>
                                        <span>{run.metrics.passRate.toFixed(0)}% pass rate</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </SurfaceCard>

                <SurfaceCard className="space-y-6">
                    {!selectedRun ? (
                        <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                            Choose a run from the left to begin reviewing cases.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-2">
                                    <div className="section-kicker">Reviewer Queue</div>
                                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">{selectedRun.name}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Review decisions are stored with this run, so future prompt comparisons keep both automated and human context.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/history")}
                                    className="rounded-2xl border border-zinc-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    Open Run History
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex flex-wrap gap-3">
                                    {([
                                        { key: "pending", label: "Pending", value: reviewedSummary.pending, tone: "amber" },
                                        { key: "approved", label: "Approved", value: reviewedSummary.approved, tone: "emerald" },
                                        { key: "rejected", label: "Rejected", value: reviewedSummary.rejected, tone: "rose" },
                                    ] as const).map((item) => (
                                        <div
                                            key={item.key}
                                            className={cn(
                                                "rounded-2xl border px-4 py-3",
                                                item.tone === "amber" && "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
                                                item.tone === "emerald" && "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
                                                item.tone === "rose" && "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"
                                            )}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{item.label}</div>
                                            <div className="mt-1 text-xl font-black text-zinc-900 dark:text-white">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative">
                                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Search reviewed cases"
                                            className="w-full rounded-2xl border border-zinc-200 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-zinc-900 outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                        />
                                    </div>
                                    <select
                                        value={filter}
                                        onChange={(event) => setFilter(event.target.value as ReviewFilter)}
                                        className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                    >
                                        <option value="all">All reviews</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredCases.length === 0 ? (
                                    <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                                        No cases match the current review filter.
                                    </div>
                                ) : (
                                    filteredCases.map((result, index) => {
                                        const testCase = getTestCase(selectedRun.testCases, result.testCaseId);
                                        const review = getReviewForResult(selectedRun, result);
                                        const effectiveStatus = getEffectiveStatus(result, review);
                                        const isSaving = savingReviewId === result.testCaseId;

                                        return (
                                            <div key={result.testCaseId} className="rounded-[2rem] border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Case {index + 1}</div>
                                                        <h4 className="mt-2 text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                                                            {testCase?.input || "Untitled case"}
                                                        </h4>
                                                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                                                            <span className={cn("rounded-full px-3 py-1", result.status === "pass" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300")}>
                                                                Auto {result.status}
                                                            </span>
                                                            <span className={cn("rounded-full px-3 py-1", effectiveStatus === "pass" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300")}>
                                                                Final {effectiveStatus}
                                                            </span>
                                                            <span className={cn(
                                                                "rounded-full px-3 py-1",
                                                                review.decision === "approved" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                                                                review.decision === "rejected" && "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
                                                                review.decision === "pending" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                                            )}>
                                                                Review {review.decision}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => void saveReview(result.testCaseId, { decision: "approved" })}
                                                            disabled={isSaving}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-500/30 dark:text-emerald-300"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => void saveReview(result.testCaseId, { decision: "rejected" })}
                                                            disabled={isSaving}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/30 dark:text-rose-300"
                                                        >
                                                            <XCircle size={14} />
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => void saveReview(result.testCaseId, { decision: "pending", overrideStatus: undefined, note: "" })}
                                                            disabled={isSaving}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
                                                        >
                                                            <RotateCcw size={14} />
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                                                    <ReviewContentCard
                                                        icon={<MessageSquareText size={16} className="text-blue-500" />}
                                                        label="Model response"
                                                        content={result.response || "No response returned."}
                                                    />
                                                    <ReviewContentCard
                                                        icon={<FileCheck2 size={16} className="text-teal-500" />}
                                                        label="Expected output"
                                                        content={testCase?.expectedOutput || "No expected output provided."}
                                                    />
                                                    <ReviewContentCard
                                                        icon={<ShieldAlert size={16} className="text-amber-500" />}
                                                        label="Automated summary"
                                                        content={`Overall ${result.overallScore.toFixed(0)}%, semantic ${result.semanticScore.toFixed(0)}%, rubric ${result.rubricScore.toFixed(0)}%, similarity ${result.similarity.toFixed(0)}%.`}
                                                    />
                                                </div>

                                                <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Override final status</label>
                                                        <select
                                                            value={review.overrideStatus || "auto"}
                                                            onChange={(event) =>
                                                                void saveReview(result.testCaseId, {
                                                                    overrideStatus: event.target.value === "auto" ? undefined : (event.target.value as "pass" | "fail"),
                                                                })
                                                            }
                                                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                                        >
                                                            <option value="auto">Use automated status</option>
                                                            <option value="pass">Force pass</option>
                                                            <option value="fail">Force fail</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Reviewer note</label>
                                                        <textarea
                                                            value={review.note}
                                                            onChange={(event) => {
                                                                const nextValue = event.target.value;
                                                                setRuns((current) =>
                                                                    current.map((run) =>
                                                                        run.id !== selectedRun.id
                                                                            ? run
                                                                            : {
                                                                                ...run,
                                                                                reviews: {
                                                                                    ...(run.reviews || {}),
                                                                                    [result.testCaseId]: {
                                                                                        ...getReviewForResult(run, result),
                                                                                        note: nextValue,
                                                                                    },
                                                                                },
                                                                            }
                                                                    )
                                                                );
                                                            }}
                                                            onBlur={(event) => void saveReview(result.testCaseId, { note: event.target.value })}
                                                            rows={4}
                                                            placeholder="Add context for future prompt changes, false positives, edge cases, or reviewer rationale."
                                                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </SurfaceCard>
            </div>
        </div>
    );
}

function ReviewContentCard({
    icon,
    label,
    content,
}: {
    icon: ReactNode;
    label: string;
    content: string;
}) {
    return (
        <div className="rounded-[1.75rem] border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                {icon}
                {label}
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{content}</div>
        </div>
    );
}
