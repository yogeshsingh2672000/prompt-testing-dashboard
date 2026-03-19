import type { Metadata } from "next";
import { CompareWorkbench } from "@/features/compare/components/CompareWorkbench";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Prompt comparison",
  description: "Run A/B prompt comparisons, diff prompt versions, and inspect case-by-case winners with Promitly.",
  path: "/compare",
});

export default function ComparePage() {
  return <CompareWorkbench />;
}
