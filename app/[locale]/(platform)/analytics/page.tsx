import type { Metadata } from "next";
import { AnalyticsHubView } from "@/features/analytics/components/AnalyticsHubView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Prompt analytics",
  description: "Track prompt quality trends, rubric analytics, regressions, and model leaderboards across saved evaluation runs.",
  path: "/analytics",
});

export default function AnalyticsPage() {
    return <AnalyticsHubView />;
}
