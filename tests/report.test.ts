import { describe, expect, it } from "vitest";
import { buildRunReportHtml, buildRunReportMarkdown } from "@/shared/lib/report";
import type { TestRun } from "@/shared/lib/persistence";

const run: TestRun = {
    id: "run-1",
    name: "Regression Run",
    timestamp: 1_700_000_000_000,
    systemPrompt: "Be precise",
    userInput: "{{input}}",
    testCases: [
        { id: "tc-1", input: "hello", expectedOutput: "hi", outputValidation: { type: "none" } },
        { id: "tc-2", input: "bye", expectedOutput: "goodbye", outputValidation: { type: "none" } },
    ],
    results: [
        {
            testCaseId: "tc-1",
            response: "hi",
            similarity: 100,
            semanticScore: 100,
            rubricScore: 100,
            overallScore: 100,
            status: "pass",
            metrics: { latencyMs: 100, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.001 },
            validation: { type: "none", enabled: false, passed: true, message: "No validation" },
            rubricResults: [],
        },
        {
            testCaseId: "tc-2",
            response: "bye",
            similarity: 20,
            semanticScore: 10,
            rubricScore: 15,
            overallScore: 12.5,
            status: "fail",
            metrics: { latencyMs: 120, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.001 },
            validation: { type: "none", enabled: false, passed: true, message: "No validation" },
            rubricResults: [],
        },
    ],
    reviews: {
        "tc-2": {
            testCaseId: "tc-2",
            decision: "rejected",
            note: "The response ignored the expected farewell format.",
            reviewedAt: 1_700_000_100_000,
            overrideStatus: "fail",
        },
    },
    config: {
        batchSize: 1,
        threshold: 85,
        modelId: "model-1",
        rubrics: [],
    },
    metrics: {
        avgSimilarity: 60,
        avgSemantic: 55,
        avgRubric: 57.5,
        avgOverall: 56.25,
        passRate: 50,
        totalCases: 2,
        passedCases: 1,
    },
};

describe("run report generation", () => {
    it("builds markdown report with failures and review context", () => {
        const markdown = buildRunReportMarkdown(run);

        expect(markdown).toContain("# Regression Run");
        expect(markdown).toContain("## Review Status");
        expect(markdown).toContain("Reviewer note: The response ignored the expected farewell format.");
        expect(markdown).toContain("## Top Failures");
    });

    it("builds html report with escaped content", () => {
        const html = buildRunReportHtml({
            ...run,
            name: 'Regression <Run>',
        });

        expect(html).toContain("Promitly Shared Report");
        expect(html).toContain("Regression &lt;Run&gt;");
        expect(html).toContain("Priority cases for review");
    });
});
