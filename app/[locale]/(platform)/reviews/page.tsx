import type { Metadata } from "next";
import { ReviewsManagerView } from "@/features/reviews/components/ReviewsManagerView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Human review workflow",
  description: "Add reviewer notes, manual approvals, and pass/fail overrides on top of automated prompt evaluation results.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return <ReviewsManagerView />;
}
