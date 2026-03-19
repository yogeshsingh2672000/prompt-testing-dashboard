import { describe, expect, it } from "vitest";
import { comparePromptVersions } from "@/shared/lib/prompt-diff";
import type { PromptVersion } from "@/shared/lib/persistence";

describe("comparePromptVersions", () => {
    it("captures text, config, rubric, and dataset deltas", () => {
        const left: PromptVersion = {
            id: "left",
            name: "Left",
            systemPrompt: "Line 1\nLine 2",
            userInput: "{{input}}",
            testCases: [{ id: "tc-1", input: "a", expectedOutput: "b" }],
            rubrics: [{ id: "accuracy", name: "Accuracy", description: "Check", weight: 2, enabled: true }],
            modelId: "model-a",
            threshold: 80,
            batchSize: 1,
            createdAt: 1,
        };
        const right: PromptVersion = {
            ...left,
            id: "right",
            name: "Right",
            systemPrompt: "Line 1\nLine 3",
            userInput: "{{input}}\n{{extra}}",
            testCases: [...left.testCases, { id: "tc-2", input: "c", expectedOutput: "d" }],
            rubrics: [{ id: "accuracy", name: "Accuracy", description: "Check", weight: 4, enabled: false }],
            modelId: "model-b",
            threshold: 90,
            batchSize: 2,
        };

        const diff = comparePromptVersions(left, right);

        expect(diff.systemPrompt.some((line) => line.type === "removed" && line.value === "Line 2")).toBe(true);
        expect(diff.systemPrompt.some((line) => line.type === "added" && line.value === "Line 3")).toBe(true);
        expect(diff.configChanges).toHaveLength(3);
        expect(diff.rubricChanges).toEqual(expect.arrayContaining([
            'Rubric "Accuracy" was disabled.',
            'Rubric "Accuracy" weight changed from 2 to 4.',
        ]));
        expect(diff.testCaseDelta).toBe(1);
    });
});
