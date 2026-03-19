"use client";

import { Clock3, Play, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { createScheduleName, getNextRunAt } from "@/shared/lib/schedule-utils";
import { ScheduledEvaluation } from "@/shared/lib/persistence";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

export function SchedulesManagerView() {
    const {
        promptVersions,
        suites,
        schedules,
        saveSchedule,
        deleteSchedule,
        runScheduleNow,
        pushToast,
    } = useDashboardWorkspace();

    const [name, setName] = useState("");
    const [promptVersionId, setPromptVersionId] = useState("");
    const [suiteId, setSuiteId] = useState("");
    const [cadenceHours, setCadenceHours] = useState(24);
    const [saving, setSaving] = useState(false);
    const [runningScheduleId, setRunningScheduleId] = useState<string | null>(null);

    const selectedVersion = useMemo(
        () => promptVersions.find((version) => version.id === promptVersionId),
        [promptVersionId, promptVersions]
    );

    const handleCreate = async () => {
        if (!selectedVersion) {
            pushToast({
                title: "Prompt version required",
                message: "Choose a saved prompt version before creating a schedule.",
                variant: "error",
            });
            return;
        }

        const now = Date.now();
        const schedule: ScheduledEvaluation = {
            id: crypto.randomUUID(),
            name: createScheduleName(name || `${selectedVersion.name} schedule`),
            suiteId: suiteId || selectedVersion.suiteId,
            promptVersionId: selectedVersion.id,
            providerId: selectedVersion.providerId,
            modelId: selectedVersion.modelId,
            batchSize: selectedVersion.batchSize,
            threshold: selectedVersion.threshold,
            rubrics: selectedVersion.rubrics,
            cadenceHours,
            enabled: true,
            createdAt: now,
            updatedAt: now,
            nextRunAt: getNextRunAt(now, cadenceHours),
        };

        setSaving(true);
        try {
            await saveSchedule(schedule);
            setName("");
            setPromptVersionId("");
            setSuiteId("");
            setCadenceHours(24);
            pushToast({
                title: "Schedule created",
                message: `"${schedule.name}" will now be available for recurring runs.`,
                variant: "success",
            });
        } catch (error) {
            pushToast({
                title: "Schedule creation failed",
                message: error instanceof Error ? error.message : "Unable to create schedule.",
                variant: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (schedule: ScheduledEvaluation) => {
        try {
            await saveSchedule({
                ...schedule,
                enabled: !schedule.enabled,
                updatedAt: Date.now(),
                nextRunAt: !schedule.enabled
                    ? schedule.nextRunAt || getNextRunAt(Date.now(), schedule.cadenceHours)
                    : schedule.nextRunAt,
            });
        } catch (error) {
            pushToast({
                title: "Schedule update failed",
                message: error instanceof Error ? error.message : "Unable to update schedule.",
                variant: "error",
            });
        }
    };

    const handleRunNow = async (scheduleId: string) => {
        setRunningScheduleId(scheduleId);
        try {
            await runScheduleNow(scheduleId);
            pushToast({
                title: "Scheduled run complete",
                message: "The run was saved to history and analytics.",
                variant: "success",
            });
        } catch (error) {
            pushToast({
                title: "Scheduled run failed",
                message: error instanceof Error ? error.message : "Unable to complete schedule run.",
                variant: "error",
            });
        } finally {
            setRunningScheduleId(null);
        }
    };

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Schedules"
                title="Create recurring prompt checks from saved versions"
                description="Pair a saved prompt version with a dataset and a cadence. Promitly can run them manually now and will also detect due schedules while the app is open."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                <SurfaceCard className="space-y-5">
                    <div>
                        <div className="section-kicker">New Schedule</div>
                        <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Recurring evaluation config</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Schedule name</label>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Daily support suite check"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Prompt version</label>
                            <select
                                value={promptVersionId}
                                onChange={(event) => setPromptVersionId(event.target.value)}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Dataset</label>
                            <select
                                value={suiteId}
                                onChange={(event) => setSuiteId(event.target.value)}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                                <option value="">Use the prompt version&apos;s saved cases</option>
                                {suites.map((suite) => (
                                    <option key={suite.id} value={suite.id}>
                                        {suite.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Cadence (hours)</label>
                            <input
                                type="number"
                                min={1}
                                max={168}
                                value={cadenceHours}
                                onChange={(event) => setCadenceHours(Math.max(1, Math.min(168, Number(event.target.value) || 24)))}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => void handleCreate()}
                        disabled={saving}
                        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                    >
                        <Plus size={16} />
                        {saving ? "Creating..." : "Create Schedule"}
                    </button>
                </SurfaceCard>

                <SurfaceCard className="space-y-5">
                    <div>
                        <div className="section-kicker">Active Schedules</div>
                        <h3 className="mt-3 text-xl font-black tracking-tight text-zinc-900 dark:text-white">Saved recurring checks</h3>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-10 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                            No schedules yet. Create one from a saved prompt version to begin recurring QA checks.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="rounded-[1.75rem] border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="text-sm font-black text-zinc-900 dark:text-white">{schedule.name}</div>
                                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                Every {schedule.cadenceHours}h - {schedule.enabled ? "Enabled" : "Paused"}
                                            </div>
                                            <div className="mt-3 grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
                                                <span>Next run: {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : "Not scheduled"}</span>
                                                <span>Last run: {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : "Never"}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => void handleRunNow(schedule.id)}
                                                disabled={runningScheduleId === schedule.id}
                                                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-700 transition hover:bg-teal-50 disabled:opacity-60 dark:border-teal-500/30 dark:text-teal-300"
                                            >
                                                <Play size={14} />
                                                {runningScheduleId === schedule.id ? "Running..." : "Run now"}
                                            </button>
                                            <button
                                                onClick={() => void handleToggle(schedule)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                                            >
                                                <Clock3 size={14} />
                                                {schedule.enabled ? "Pause" : "Resume"}
                                            </button>
                                            <button
                                                onClick={() => void deleteSchedule(schedule.id)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SurfaceCard>
            </div>
        </div>
    );
}
