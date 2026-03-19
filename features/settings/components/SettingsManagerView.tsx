"use client";

import { RotateCcw, Save, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { RUBRIC_PRESETS } from "@/shared/constants/defaults";
import { getModelDisplayName, getModelsByProvider, SUPPORTED_PROVIDERS } from "@/shared/constants/models";
import { AppSettings } from "@/shared/lib/persistence";
import { LLMProviderId, RubricDefinition } from "@/shared/types";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

function cloneRubrics(rubrics: readonly RubricDefinition[]) {
    return rubrics.map((rubric) => ({ ...rubric }));
}

export function SettingsManagerView() {
    const {
        settings,
        saveSettings,
        resetSettings,
        applySettingsToWorkspace,
        promptVersions,
        suites,
        setGlobalBaselinePromptVersionId,
        setSuiteBaselinePromptVersionId,
        pushToast,
    } = useDashboardWorkspace();

    const [draft, setDraft] = useState<AppSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    const modelsForDraftProvider = getModelsByProvider(draft.defaultProviderId || "bedrock");

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDraft(settings);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [settings]);

    const updateRubric = (id: string, updates: Partial<RubricDefinition>) => {
        setDraft((current) => ({
            ...current,
            defaultRubrics: current.defaultRubrics.map((rubric) =>
                rubric.id === id ? { ...rubric, ...updates } : rubric
            ),
        }));
    };

    const handlePresetChange = (presetId: string) => {
        const preset = RUBRIC_PRESETS.find((entry) => entry.id === presetId);
        if (!preset) {
            return;
        }

        setDraft((current) => ({
            ...current,
            rubricPresetId: preset.id,
            defaultRubrics: cloneRubrics(preset.rubrics),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const nextSettings: AppSettings = {
            ...draft,
            updatedAt: Date.now(),
        };

        try {
            await saveSettings(nextSettings);
            applySettingsToWorkspace(nextSettings);
            pushToast({
                title: "Settings saved",
                message: "Default evaluator settings are now updated for future workspace sessions.",
                variant: "success",
            });
        } catch (error) {
            pushToast({
                title: "Settings save failed",
                message: error instanceof Error ? error.message : "Unable to save settings.",
                variant: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        try {
            await resetSettings();
            pushToast({
                title: "Settings reset",
                message: "Promitly defaults have been restored.",
                variant: "success",
            });
        } catch (error) {
            pushToast({
                title: "Reset failed",
                message: error instanceof Error ? error.message : "Unable to reset settings.",
                variant: "error",
            });
        }
    };

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Settings"
                title="Manage evaluator defaults and rubric presets"
                description="Control the default model, threshold, batch size, and reusable rubric profile that new workspace sessions should start from."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <SurfaceCard className="space-y-6">
                    <div className="space-y-2">
                        <div className="section-kicker">Evaluator Defaults</div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Workspace startup configuration</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            These defaults are applied to the workspace when the app loads and can be reused across future prompt experiments.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Default provider</label>
                            <select
                                value={draft.defaultProviderId || "bedrock"}
                                onChange={(event) =>
                                    setDraft((current) => {
                                        const nextProviderId = event.target.value as LLMProviderId;
                                        const nextModelId = getModelsByProvider(nextProviderId)[0]?.id || current.defaultModelId;

                                        return {
                                            ...current,
                                            defaultProviderId: nextProviderId,
                                            defaultModelId: nextModelId,
                                        };
                                    })
                                }
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                                {SUPPORTED_PROVIDERS.map((provider) => (
                                    <option key={provider.id} value={provider.id}>
                                        {provider.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Default model</label>
                            <select
                                value={draft.defaultModelId}
                                onChange={(event) => setDraft((current) => ({ ...current, defaultModelId: event.target.value }))}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                                {modelsForDraftProvider.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Default threshold</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={draft.defaultThreshold}
                                onChange={(event) => setDraft((current) => ({ ...current, defaultThreshold: Math.max(0, Math.min(100, Number(event.target.value) || 0)) }))}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Default batch size</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={draft.defaultBatchSize}
                                onChange={(event) => setDraft((current) => ({ ...current, defaultBatchSize: Math.max(1, Math.min(20, Number(event.target.value) || 1)) }))}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Rubric preset</label>
                            <select
                                value={draft.rubricPresetId || RUBRIC_PRESETS[0].id}
                                onChange={(event) => handlePresetChange(event.target.value)}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                                {RUBRIC_PRESETS.map((preset) => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {RUBRIC_PRESETS.find((preset) => preset.id === draft.rubricPresetId)?.description}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {draft.defaultRubrics.map((rubric) => (
                                <div key={rubric.id} className="rounded-[1.5rem] border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-3 text-sm font-black text-zinc-900 dark:text-zinc-100">
                                                <input
                                                    type="checkbox"
                                                    checked={rubric.enabled}
                                                    onChange={(event) => updateRubric(rubric.id, { enabled: event.target.checked })}
                                                    className="h-4 w-4 rounded border-zinc-300 text-teal-500 focus:ring-teal-500/30"
                                                />
                                                {rubric.name}
                                            </label>
                                            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{rubric.description}</p>
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Weight</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={5}
                                                value={rubric.weight}
                                                disabled={!rubric.enabled}
                                                onChange={(event) => updateRubric(rubric.id, { weight: Math.max(1, Math.min(5, Number(event.target.value) || 1)) })}
                                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-teal-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-[1.75rem] border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                        <div className="space-y-2">
                            <div className="section-kicker">Baselines</div>
                            <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Regression reference versions</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Assign approved prompt versions that future analytics should compare against globally or per suite.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Global baseline</label>
                            <select
                                value={settings.globalBaselinePromptVersionId || ""}
                                onChange={(event) => void setGlobalBaselinePromptVersionId(event.target.value || undefined)}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                            >
                                <option value="">No global baseline</option>
                                {promptVersions.map((version) => (
                                    <option key={version.id} value={version.id}>
                                        {version.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            {suites.map((suite) => {
                                const suiteVersions = promptVersions.filter((version) => version.suiteId === suite.id);
                                return (
                                    <div key={suite.id} className="rounded-[1.5rem] border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                                        <div className="mb-3">
                                            <div className="text-sm font-black text-zinc-900 dark:text-white">{suite.name}</div>
                                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                {suiteVersions.length} saved versions available
                                            </div>
                                        </div>
                                        <select
                                            value={settings.baselinePromptVersionIdsBySuite[suite.id] || ""}
                                            onChange={(event) => void setSuiteBaselinePromptVersionId(suite.id, event.target.value || undefined)}
                                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                                        >
                                            <option value="">Use global baseline</option>
                                            {suiteVersions.map((version) => (
                                                <option key={version.id} value={version.id}>
                                                    {version.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SurfaceCard>

                <SurfaceCard className="space-y-6">
                    <div className="space-y-2">
                        <div className="section-kicker">Actions</div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Apply or reset defaults</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Save these settings for future sessions, or restore the original Promitly defaults if you want a clean baseline.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                        >
                            <Save size={16} />
                            {isSaving ? "Saving..." : "Save And Apply Defaults"}
                        </button>
                        <button
                            onClick={() => applySettingsToWorkspace(draft)}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-black text-zinc-700 shadow-sm transition hover:border-teal-400 hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        >
                            <SlidersHorizontal size={16} />
                            Apply To Current Workspace
                        </button>
                        <button
                            onClick={() => void handleReset()}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-black text-zinc-700 shadow-sm transition hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        >
                            <RotateCcw size={16} />
                            Reset To Promitly Defaults
                        </button>
                    </div>

                    <div className="rounded-[1.75rem] border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Current saved state</div>
                        <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                            <div>Provider: {SUPPORTED_PROVIDERS.find((provider) => provider.id === settings.defaultProviderId)?.name || "Default provider"}</div>
                            <div>Model: {getModelDisplayName(settings.defaultModelId)}</div>
                            <div>Threshold: {settings.defaultThreshold}%</div>
                            <div>Batch size: {settings.defaultBatchSize}</div>
                            <div>Enabled rubrics: {settings.defaultRubrics.filter((rubric) => rubric.enabled).length}</div>
                            <div>Global baseline: {promptVersions.find((version) => version.id === settings.globalBaselinePromptVersionId)?.name || "Not set"}</div>
                            <div>Updated: {new Date(settings.updatedAt).toLocaleString()}</div>
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </div>
    );
}
