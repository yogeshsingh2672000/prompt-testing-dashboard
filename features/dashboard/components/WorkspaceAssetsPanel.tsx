"use client";

import { FolderPlus, GitBranchPlus, Layers3, Upload } from "lucide-react";
import { useState } from "react";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { getModelDisplayName } from "@/shared/constants/models";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";
import { cn } from "@/shared/lib/utils";

export function WorkspaceAssetsPanel() {
    const {
        suites,
        promptVersions,
        activeSuiteId,
        activePromptVersionId,
        saveCurrentSuite,
        loadSuite,
        deleteSuite,
        savePromptVersion,
        loadPromptVersion,
        deletePromptVersion,
        pushToast,
    } = useDashboardWorkspace();
    const [suiteName, setSuiteName] = useState("");
    const [versionName, setVersionName] = useState("");
    const [savingSuite, setSavingSuite] = useState(false);
    const [savingVersion, setSavingVersion] = useState(false);

    const handleSaveSuite = async () => {
        setSavingSuite(true);
        try {
            await saveCurrentSuite(suiteName);
            setSuiteName("");
        } catch (error) {
            pushToast({
                title: "Suite save failed",
                message: error instanceof Error ? error.message : "Unable to save suite.",
                variant: "error",
            });
        } finally {
            setSavingSuite(false);
        }
    };

    const handleSaveVersion = async () => {
        setSavingVersion(true);
        try {
            await savePromptVersion(versionName);
            setVersionName("");
        } catch (error) {
            pushToast({
                title: "Version save failed",
                message: error instanceof Error ? error.message : "Unable to save prompt version.",
                variant: "error",
            });
        } finally {
            setSavingVersion(false);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <SurfaceCard className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="section-kicker">Suites</div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Reusable test suites</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Capture the current prompt blueprint and test set as a reusable asset for future evaluation runs.</p>
                    </div>
                    <FolderPlus className="text-teal-500" size={18} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={suiteName}
                        onChange={(event) => setSuiteName(event.target.value)}
                        placeholder="Name this suite"
                        className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <button
                        onClick={handleSaveSuite}
                        disabled={savingSuite}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                    >
                        <Upload size={14} />
                        {savingSuite ? "Saving..." : "Save Suite"}
                    </button>
                </div>

                <div className="space-y-3">
                    {suites.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                            No saved suites yet. Save the current workspace as your first reusable suite.
                        </div>
                    ) : (
                        suites.slice(0, 4).map((suite) => (
                            <div
                                key={suite.id}
                                className={cn(
                                    "flex flex-col gap-3 rounded-[1.75rem] border px-4 py-4 transition sm:flex-row sm:items-center sm:justify-between",
                                    activeSuiteId === suite.id
                                        ? "border-teal-500/40 bg-teal-500/10"
                                        : "border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/60"
                                )}
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-black text-zinc-900 dark:text-white">{suite.name}</div>
                                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                        {suite.testCases.length} cases - updated {new Date(suite.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => loadSuite(suite)}
                                        className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 transition hover:border-teal-500 hover:text-teal-600 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => void deleteSuite(suite.id)}
                                        className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-500 transition hover:bg-red-500/10"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="section-kicker">Versions</div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Prompt versions</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Save named prompt snapshots with model and threshold config so upcoming compare flows have real version history to work with.</p>
                    </div>
                    <GitBranchPlus className="text-blue-500" size={18} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={versionName}
                        onChange={(event) => setVersionName(event.target.value)}
                        placeholder="Name this version"
                        className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <button
                        onClick={handleSaveVersion}
                        disabled={savingVersion}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                    >
                        <Layers3 size={14} />
                        {savingVersion ? "Saving..." : "Save Version"}
                    </button>
                </div>

                <div className="space-y-3">
                    {promptVersions.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                            No saved prompt versions yet. Save your first prompt snapshot before moving into compare mode.
                        </div>
                    ) : (
                        promptVersions.slice(0, 4).map((version) => (
                            <div
                                key={version.id}
                                className={cn(
                                    "flex flex-col gap-3 rounded-[1.75rem] border px-4 py-4 transition sm:flex-row sm:items-center sm:justify-between",
                                    activePromptVersionId === version.id
                                        ? "border-blue-500/40 bg-blue-500/10"
                                        : "border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/60"
                                )}
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-black text-zinc-900 dark:text-white">{version.name}</div>
                                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                        {getModelDisplayName(version.modelId)} - threshold {version.threshold}% - {new Date(version.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => loadPromptVersion(version)}
                                        className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => void deletePromptVersion(version.id)}
                                        className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-500 transition hover:bg-red-500/10"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SurfaceCard>
        </div>
    );
}
