import type { Metadata } from "next";
import { HistoryView } from "@/features/dashboard/components/HistoryView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Evaluation history",
  description: "Browse saved prompt evaluation runs, reload previous experiments, and export prompt QA reports from Promitly.",
  path: "/history",
});

export default function HistoryPage() {
  return <HistoryView />;
}
