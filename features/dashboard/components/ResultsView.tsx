"use client";

import { AnalyticsSection } from "./AnalyticsSection";
import { ResultsSection } from "./ResultsSection";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";

export function ResultsView() {
    const { results, loading, testCases, error } = useDashboardWorkspace();

    return (
        <div className="flex flex-col gap-8">
            {results.length > 0 && !loading && <AnalyticsSection results={results} />}
            <ResultsSection results={results} loading={loading} testCases={testCases} error={error} />
        </div>
    );
}
