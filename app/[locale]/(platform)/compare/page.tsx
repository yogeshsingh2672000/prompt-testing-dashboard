import { ComingSoonPage } from "@/features/navigation/components/ComingSoonPage";

export default function ComparePage() {
  return (
    <ComingSoonPage
      eyebrow="Next Phase"
      title="Prompt And Model Comparison"
      description="This page is reserved for A/B evaluation across prompt versions and models. The navigation is now ready for it, so we can build comparison workflows next without reworking the shell again."
      bullets={[
        "Compare two prompt versions against the same suite",
        "Compare multiple Bedrock models side by side",
        "See per-test winners, score deltas, latency deltas, and cost deltas",
        "Promote the winning version back into the workspace",
      ]}
    />
  );
}
