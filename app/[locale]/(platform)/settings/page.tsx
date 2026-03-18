import { ComingSoonPage } from "@/features/navigation/components/ComingSoonPage";

export default function SettingsPage() {
  return (
    <ComingSoonPage
      eyebrow="Next Phase"
      title="Workspace Settings"
      description="Settings will centralize evaluator defaults and workspace preferences. This gives us a clean place for models, rubric presets, scoring rules, and future team-level configuration."
      bullets={[
        "Manage default models and thresholds",
        "Define reusable rubric presets",
        "Add structured output validation rules",
        "Control workspace-level persistence and export preferences",
      ]}
    />
  );
}
