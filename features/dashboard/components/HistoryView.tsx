"use client";

import { useRouter } from "@/i18n/routing";
import { HistorySection } from "./HistorySection";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export function HistoryView() {
    const router = useRouter();
    const { activeRunId, loadRun } = useDashboardWorkspace();

    return (
        <div className="space-y-8">
            <SectionHeading
                eyebrow="History"
                title="Reload past experiments without losing context"
                description="Every saved run stays connected to the shared workspace state, so loading an older experiment immediately updates the results route and current session."
            />
            <HistorySection
                activeRunId={activeRunId}
                onLoadRun={(run) => {
                    loadRun(run);
                    router.push("/results");
                }}
            />
        </div>
    );
}
