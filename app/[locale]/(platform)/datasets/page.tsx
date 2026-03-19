import type { Metadata } from "next";
import { DatasetsManagerView } from "@/features/datasets/components/DatasetsManagerView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Prompt datasets",
  description: "Manage reusable prompt test suites, import datasets, and export evaluation-ready cases in JSON or CSV.",
  path: "/datasets",
});

export default function DatasetsPage() {
  return <DatasetsManagerView />;
}
