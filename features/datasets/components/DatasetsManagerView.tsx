"use client";

import { FolderKanban, LibraryBig } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { SectionHeading } from "@/shared/ui/SectionHeading";
import { SurfaceCard } from "@/shared/ui/SurfaceCard";

export function DatasetsManagerView() {
    const router = useRouter();
    const { suites, loadSuite, deleteSuite, pushToast } = useDashboardWorkspace();

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
