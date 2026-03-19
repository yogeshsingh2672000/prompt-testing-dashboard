import { describe, expect, it } from "vitest";
import { createScheduleName, getNextRunAt, isScheduleDue } from "@/shared/lib/schedule-utils";
import type { ScheduledEvaluation } from "@/shared/lib/persistence";

describe("schedule utils", () => {
    it("builds schedule names and computes next run times", () => {
        expect(createScheduleName("  Daily Check  ")).toBe("Daily Check");
        expect(createScheduleName("")).toBe("Scheduled Evaluation");
        expect(getNextRunAt(1000, 2)).toBe(1000 + 2 * 60 * 60 * 1000);
    });

    it("detects due schedules", () => {
        const schedule: ScheduledEvaluation = {
            id: "schedule-1",
            name: "Daily",
            promptVersionId: "version-1",
            batchSize: 1,
            threshold: 80,
            rubrics: [],
            cadenceHours: 24,
            enabled: true,
            createdAt: 1,
            updatedAt: 1,
            nextRunAt: 1000,
        };

        expect(isScheduleDue(schedule, 2000)).toBe(true);
        expect(isScheduleDue({ ...schedule, enabled: false }, 2000)).toBe(false);
    });
});
