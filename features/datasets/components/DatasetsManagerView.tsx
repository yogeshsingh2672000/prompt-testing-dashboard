"use client";

import { Download, FileUp, FolderKanban, LibraryBig } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { downloadFile, parseImportedSuites, suiteToCsv, suitesToJson } from "@/shared/lib/export";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

export function DatasetsManagerView() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const { suites, loadSuite, deleteSuite, importSuites, pushToast } = useDashboardWorkspace();

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsImporting(true);
        try {
            const importedSuites = await parseImportedSuites(file);
            const importedCount = await importSuites(importedSuites);
            pushToast({
                title: "Datasets imported",
                message: `Imported ${importedCount} suite${importedCount === 1 ? "" : "s"} from ${file.name}.`,
                variant: "success",
            });
        } catch (error) {
            pushToast({
                title: "Import failed",
                message: error instanceof Error ? error.message : "Unable to import datasets.",
                variant: "error",
            });
        } finally {
            event.target.value = "";
            setIsImporting(false);
        }
    };

    const handleExportLibrary = () => {
        if (suites.length === 0) {
            pushToast({
                title: "Nothing to export",
                message: "Save or import at least one suite before exporting the library.",
                variant: "error",
            });
            return;
        }

        downloadFile(suitesToJson(suites), "promitly-datasets.json", "application/json");
        pushToast({
            title: "Library exported",
            message: `Exported ${suites.length} suite${suites.length === 1 ? "" : "s"} as JSON.`,
            variant: "success",
        });
    };

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="Datasets"
                title="Manage reusable evaluation suites"
                description="Suites are now real platform assets. Use this page to curate shared prompt test collections, reload them into the workspace, and prepare for future bulk comparison workflows."
            />

            <SurfaceCard className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="section-kicker">Library</div>
                        <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Saved suites</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">These are the named test suites captured from the workspace. Loading one will move you back into the workspace with that dataset ready to iterate on.</p>
                    </div>
                    <FolderKanban className="text-orange-500" size={18} />
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".json,.csv"
                    className="hidden"
                    onChange={(event) => void handleImport(event)}
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={isImporting}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                    >
                        <FileUp size={16} />
                        {isImporting ? "Importing..." : "Import JSON or CSV"}
                    </button>
                    <button
                        onClick={handleExportLibrary}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-black text-zinc-700 shadow-sm transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                        <Download size={16} />
                        Export Entire Library
                    </button>
                </div>

                {suites.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-zinc-200 px-5 py-10 text-center dark:border-zinc-800">
                        <LibraryBig className="mx-auto mb-4 text-zinc-400" size={28} />
                        <p className="text-base font-bold text-zinc-900 dark:text-white">No datasets saved yet</p>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Save a suite from the workspace to start building your shared evaluation library.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {suites.map((suite) => (
                            <div key={suite.id} className="rounded-[1.75rem] border border-zinc-200 bg-white/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">{suite.name}</h4>
                                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                            {suite.testCases.length} cases • updated {new Date(suite.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            loadSuite(suite);
                                            router.push("/workspace");
                                        }}
                                        className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-sm dark:bg-white dark:text-zinc-900"
                                    >
                                        Open In Workspace
                                    </button>
                                    <button
                                        onClick={() => downloadFile(suiteToCsv(suite), `${suite.name.replace(/\s+/g, "-").toLowerCase() || "suite"}.csv`, "text/csv;charset=utf-8")}
                                        className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Export CSV
                                    </button>
                                    <button
                                        onClick={() => downloadFile(suitesToJson([suite]), `${suite.name.replace(/\s+/g, "-").toLowerCase() || "suite"}.json`, "application/json")}
                                        className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-300"
                                    >
                                        Export JSON
                                    </button>
                                    <button
                                        onClick={() => {
                                            void deleteSuite(suite.id);
                                            pushToast({ title: "Suite removed", message: `"${suite.name}" was removed from datasets.`, variant: "success" });
                                        }}
                                        className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-500 transition hover:bg-red-500/10 dark:border-zinc-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SurfaceCard>
        </div>
    );
}
