import { PromptVersion } from "@/shared/lib/persistence";

export interface PromptDiffLine {
    value: string;
    type: "added" | "removed" | "unchanged";
}

export interface PromptVersionDiff {
    systemPrompt: PromptDiffLine[];
    userInput: PromptDiffLine[];
    configChanges: string[];
    rubricChanges: string[];
    testCaseDelta: number;
}

function diffText(leftText: string, rightText: string): PromptDiffLine[] {
    const leftLines = leftText.split(/\r?\n/);
    const rightLines = rightText.split(/\r?\n/);
    const maxLength = Math.max(leftLines.length, rightLines.length);
    const lines: PromptDiffLine[] = [];

    for (let index = 0; index < maxLength; index += 1) {
        const left = leftLines[index];
        const right = rightLines[index];

        if (left === right) {
            lines.push({ value: left || "", type: "unchanged" });
            continue;
        }

        if (left !== undefined) {
            lines.push({ value: left, type: "removed" });
        }

        if (right !== undefined) {
            lines.push({ value: right, type: "added" });
        }
    }

    return lines;
}

export function comparePromptVersions(left: PromptVersion, right: PromptVersion): PromptVersionDiff {
    const configChanges: string[] = [];
    if (left.modelId !== right.modelId) {
        configChanges.push(`Model changed from ${left.modelId || "default"} to ${right.modelId || "default"}.`);
    }
    if (left.threshold !== right.threshold) {
        configChanges.push(`Threshold changed from ${left.threshold}% to ${right.threshold}%.`);
    }
    if (left.batchSize !== right.batchSize) {
        configChanges.push(`Batch size changed from ${left.batchSize} to ${right.batchSize}.`);
    }

    const leftRubrics = new Map(left.rubrics.map((rubric) => [rubric.id, rubric]));
    const rightRubrics = new Map(right.rubrics.map((rubric) => [rubric.id, rubric]));
    const rubricIds = new Set([...leftRubrics.keys(), ...rightRubrics.keys()]);
    const rubricChanges = Array.from(rubricIds).flatMap((rubricId) => {
        const before = leftRubrics.get(rubricId);
        const after = rightRubrics.get(rubricId);

        if (!before && after) {
            return [`Rubric "${after.name}" was added.`];
        }

        if (before && !after) {
            return [`Rubric "${before.name}" was removed.`];
        }

        if (!before || !after) {
            return [];
        }

        const changes: string[] = [];
        if (before.enabled !== after.enabled) {
            changes.push(`Rubric "${after.name}" was ${after.enabled ? "enabled" : "disabled"}.`);
        }
        if (before.weight !== after.weight) {
            changes.push(`Rubric "${after.name}" weight changed from ${before.weight} to ${after.weight}.`);
        }
        return changes;
    });

    return {
        systemPrompt: diffText(left.systemPrompt, right.systemPrompt),
        userInput: diffText(left.userInput, right.userInput),
        configChanges,
        rubricChanges,
        testCaseDelta: right.testCases.length - left.testCases.length,
    };
}
