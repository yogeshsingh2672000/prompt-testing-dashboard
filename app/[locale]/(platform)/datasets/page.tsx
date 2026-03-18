import { ComingSoonPage } from "@/features/navigation/components/ComingSoonPage";

export default function DatasetsPage() {
  return (
    <ComingSoonPage
      eyebrow="Next Phase"
      title="Reusable Test Suites"
      description="Datasets will turn one-off prompt checks into reusable prompt QA assets. This route is now ready for saved suites, imports, tagging, and shared evaluation datasets."
      bullets={[
        "Save named suites with prompt metadata",
        "Import CSV and JSON test cases",
        "Tag edge cases, safety tests, and business-critical flows",
        "Reuse the same suite across prompts and models",
      ]}
    />
  );
}
