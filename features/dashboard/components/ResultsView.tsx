"use client";

import { AnalyticsSection } from "./AnalyticsSection";
import { ResultsSection } from "./ResultsSection";
import { useDashboardWorkspace } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export function ResultsView() {
    const { results, loading, testCases, error } = useDashboardWorkspace();

    return (
        <div className="flex flex-col gap-8">
            <SectionHeading
                eyebrow="Results"
                title="Inspect quality, efficiency, and failure patterns"
                description="Follow the live evaluation state, review score distributions, and use the results table as the source of truth for prompt iteration."
            />
            {results.length > 0 && !loading && <AnalyticsSection results={results} />}
            <ResultsSection results={results} loading={loading} testCases={testCases} error={error} />
        </div>
    );
}
