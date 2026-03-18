import { describe, expect, it } from "vitest";
import {
    calculateOverallScore,
    calculateRubricScore,
    summarizeEvaluationResults,
    toComparisonMetricsSummary,
} from "@/shared/lib/evaluation-summary";
import type { EvaluationResult } from "@/shared/types";

const results: EvaluationResult[] = [
    {
        testCaseId: "tc-1",
        response: "one",
        similarity: 90,
        semanticScore: 80,
        rubricScore: 70,
        overallScore: 75,
        status: "pass",
        metrics: { latencyMs: 100, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.01 },
        validation: { type: "none", enabled: false, passed: true, message: "" },
        rubricResults: [],
    },
    {
        testCaseId: "tc-2",
        response: "two",
        similarity: 50,
        semanticScore: 40,
        rubricScore: 20,
        overallScore: 30,
        status: "fail",
        metrics: { latencyMs: 300, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.03 },
        validation: { type: "none", enabled: false, passed: true, message: "" },
        rubricResults: [],
    },
];

describe("evaluation summary utilities", () => {
    it("calculates weighted rubric and overall scores", () => {
        const rubricScore = calculateRubricScore(60, [
            { rubricId: "accuracy", name: "Accuracy", score: 80, weight: 3, reasoning: "" },
            { rubricId: "tone", name: "Tone", score: 20, weight: 1, reasoning: "" },
        ]);

        expect(rubricScore).toBe(65);
        expect(calculateOverallScore(60, rubricScore, [
            { rubricId: "accuracy", name: "Accuracy", score: 80, weight: 3, reasoning: "" },
        ])).toBe(62.5);
        expect(calculateRubricScore(60, [])).toBe(60);
        expect(calculateOverallScore(60, 60, [])).toBe(60);
    });

    it("summarizes evaluation results for runs", () => {
        const summary = summarizeEvaluationResults(results);

        expect(summary.avgSimilarity).toBe(70);
        expect(summary.avgSemantic).toBe(60);
        expect(summary.avgRubric).toBe(45);
        expect(summary.avgOverall).toBe(52.5);
        expect(summary.passRate).toBe(50);
        expect(summary.totalCases).toBe(2);
        expect(summary.passedCases).toBe(1);
    });

    it("builds comparison summary including latency and cost", () => {
        const summary = toComparisonMetricsSummary(results);

        expect(summary.avgOverallScore).toBe(52.5);
        expect(summary.avgLatencyMs).toBe(200);
        expect(summary.totalCostUsd).toBe(0.04);
    });
});
