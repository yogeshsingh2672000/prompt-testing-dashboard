import { describe, expect, it } from "vitest";
import { buildModelLeaderboard, buildRegressionSummary, buildRubricAnalytics, buildTrendPoints, findBaselineRun, resolveBaselinePromptVersionId } from "@/shared/lib/run-analytics";
import type { PromptVersion, TestRun } from "@/shared/lib/persistence";

const runs: TestRun[] = [
    {
        id: "run-1",
        suiteId: "suite-1",
        promptVersionId: "version-a",
        name: "Run 1",
        timestamp: 1,
        systemPrompt: "Prompt",
        userInput: "{{input}}",
        testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi", outputValidation: { type: "none" } }],
        results: [{
            testCaseId: "tc-1",
            response: "hi",
            similarity: 90,
            semanticScore: 88,
            rubricScore: 80,
            overallScore: 84,
            status: "pass",
            metrics: { latencyMs: 200, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.01 },
            validation: { type: "none", enabled: false, passed: true, message: "" },
            rubricResults: [{ rubricId: "accuracy", name: "Accuracy", score: 80, weight: 2, reasoning: "" }],
        }],
        config: { batchSize: 1, threshold: 80, modelId: "model-a", rubrics: [] },
        metrics: { avgSimilarity: 90, avgSemantic: 88, avgRubric: 80, avgOverall: 84, passRate: 100, totalCases: 1, passedCases: 1, validationPassRate: 100 },
    },
    {
        id: "run-2",
        suiteId: "suite-1",
        promptVersionId: "version-b",
        name: "Run 2",
        timestamp: 2,
        systemPrompt: "Prompt",
        userInput: "{{input}}",
        testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi", outputValidation: { type: "none" } }],
        results: [{
            testCaseId: "tc-1",
            response: "oops",
            similarity: 40,
            semanticScore: 45,
            rubricScore: 50,
            overallScore: 47,
            status: "fail",
            metrics: { latencyMs: 400, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.02 },
            validation: { type: "none", enabled: false, passed: true, message: "" },
            rubricResults: [{ rubricId: "accuracy", name: "Accuracy", score: 50, weight: 2, reasoning: "" }],
        }],
        config: { batchSize: 1, threshold: 80, modelId: "model-b", rubrics: [] },
        metrics: { avgSimilarity: 40, avgSemantic: 45, avgRubric: 50, avgOverall: 47, passRate: 0, totalCases: 1, passedCases: 0, validationPassRate: 100 },
    },
];

const versions: PromptVersion[] = [
    {
        id: "version-a",
        name: "Version A",
        systemPrompt: "Prompt",
        userInput: "{{input}}",
        testCases: [],
        rubrics: [],
        threshold: 80,
        batchSize: 1,
        suiteId: "suite-1",
        createdAt: 1,
    },
];

describe("run analytics", () => {
    it("builds trend points, rubric analytics, and model leaderboard entries", () => {
        const trend = buildTrendPoints(runs, 5);
        const rubrics = buildRubricAnalytics(runs);
        const leaderboard = buildModelLeaderboard(runs);

        expect(trend).toHaveLength(2);
        expect(trend[1].avgOverall).toBe(47);
        expect(rubrics[0].name).toBe("Accuracy");
        expect(leaderboard[0].avgOverall).toBeGreaterThan(leaderboard[1].avgOverall);
    });

    it("finds baselines and reports regressions", () => {
        const baselineRun = findBaselineRun(runs, runs[1], "version-a");
        const summary = buildRegressionSummary(runs[1], baselineRun);

        expect(baselineRun?.id).toBe("run-1");
        expect(summary.hasBaseline).toBe(true);
        expect(summary.passRateDelta).toBe(-100);
        expect(summary.newlyFailingCases).toEqual(["tc-1"]);
    });

    it("resolves suite and global baseline version ids", () => {
        expect(resolveBaselinePromptVersionId("suite-1", versions, undefined, { "suite-1": "version-a" })).toBe("version-a");
        expect(resolveBaselinePromptVersionId(undefined, versions, "version-a", {})).toBe("version-a");
        expect(resolveBaselinePromptVersionId("suite-2", versions, undefined, {})).toBeUndefined();
    });
});
