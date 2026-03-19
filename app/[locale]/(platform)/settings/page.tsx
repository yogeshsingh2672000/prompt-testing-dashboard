import type { Metadata } from "next";
import { SettingsManagerView } from "@/features/settings/components/SettingsManagerView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Evaluator settings",
  description: "Configure default models, thresholds, rubrics, and baselines for prompt evaluation and regression tracking.",
  path: "/settings",
});

export default function SettingsPage() {
  return <SettingsManagerView />;
}
