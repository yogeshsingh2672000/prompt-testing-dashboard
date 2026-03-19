import { ScheduledEvaluation } from "@/shared/lib/persistence";

export function getNextRunAt(from: number, cadenceHours: number) {
    return from + cadenceHours * 60 * 60 * 1000;
}

export function isScheduleDue(schedule: ScheduledEvaluation, now = Date.now()) {
    return Boolean(schedule.enabled && schedule.nextRunAt && schedule.nextRunAt <= now);
}

export function createScheduleName(baseName: string) {
    return baseName.trim() || "Scheduled Evaluation";
}
