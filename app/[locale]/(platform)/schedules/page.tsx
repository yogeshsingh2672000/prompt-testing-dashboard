import type { Metadata } from "next";
import { SchedulesManagerView } from "@/features/schedules/components/SchedulesManagerView";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Scheduled prompt checks",
  description: "Create recurring prompt evaluation schedules for regression checks, saved prompt versions, and curated datasets.",
  path: "/schedules",
});

export default function SchedulesPage() {
    return <SchedulesManagerView />;
}
