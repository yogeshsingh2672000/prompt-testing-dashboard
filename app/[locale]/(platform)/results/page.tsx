import type { Metadata } from "next";
import { ResultsView } from "@/features/dashboard/components/ResultsView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Evaluation results",
  description: "Inspect prompt evaluation results, semantic scores, rubric scores, latency, cost, and structured output validation in Promitly.",
  path: "/results",
});

export default function ResultsPage() {
  return <ResultsView />;
}
