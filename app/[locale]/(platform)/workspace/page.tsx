import type { Metadata } from "next";
import { WorkspaceView } from "@/features/dashboard/components/WorkspaceView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Prompt workspace",
  description: "Design prompts, build test cases, tune rubrics, and create reusable evaluation scenarios in Promitly's prompt workspace.",
  path: "/workspace",
});

export default function WorkspacePage() {
  return <WorkspaceView />;
}
