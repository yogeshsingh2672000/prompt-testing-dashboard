import { ComingSoonPage } from "@/features/navigation/components/ComingSoonPage";

export default function ReviewsPage() {
  return (
    <ComingSoonPage
      eyebrow="Next Phase"
      title="Human Review Workflow"
      description="Reviews will let you annotate failures, override scores, and turn prompt evaluation into a real QA process. The route exists now so the workflow can be layered in cleanly."
      bullets={[
        "Mark false positives and false negatives",
        "Add reviewer notes to failed cases",
        "Approve or reject suggested prompt revisions",
        "Track quality changes over time with reviewer context",
      ]}
    />
  );
}
