"use client";

import { useRouter } from "@/i18n/routing";
import { HistorySection } from "./HistorySection";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";

export function HistoryView() {
    const router = useRouter();
    const { activeRunId, loadRun } = useDashboardWorkspace();

    return (
        <HistorySection
            activeRunId={activeRunId}
            onLoadRun={(run) => {
                loadRun(run);
                router.push("/results");
            }}
        />
    );
}
