import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EvaluationRequest, RubricDefinition } from "@/shared/types";

const getResponseMock = vi.fn();
const getEmbeddingMock = vi.fn();
const getSemanticScoreMock = vi.fn();
const getRubricScoresMock = vi.fn();

vi.mock("@/server/lib/ai", () => ({
    getResponse: getResponseMock,
    getEmbedding: getEmbeddingMock,
}));

vi.mock("@/server/lib/evaluator", () => ({
    getSemanticScore: getSemanticScoreMock,
    getRubricScores: getRubricScoresMock,
}));

describe("evaluatePrompt", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns passing results when semantic, rubric, and validation checks succeed", async () => {
        const { evaluatePrompt } = await import("@/server/services/evaluation-service");

        getResponseMock.mockResolvedValue({
            text: '{"answer":"hi"}',
            usage: { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 },
        });
        getEmbeddingMock
            .mockResolvedValueOnce([1, 0])
            .mockResolvedValueOnce([1, 0]);
        getSemanticScoreMock.mockResolvedValue(92);
        getRubricScoresMock.mockResolvedValue([
            { rubricId: "accuracy", name: "Accuracy", score: 88, weight: 2, reasoning: "Strong match" },
        ]);

        const request: EvaluationRequest = {
            systemPrompt: "You are helpful",
            userInput: "{{input}}",
            testCases: [
                {
                    id: "tc-1",
                    input: "Say hi",
                    expectedOutput: '{"answer":"hi"}',
                    outputValidation: { type: "json" },
                },
            ],
            batchSize: 1,
            threshold: 85,
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            rubrics: [{ id: "accuracy", name: "Accuracy", description: "Correctness", weight: 2, enabled: true }],
        };

        const [result] = await evaluatePrompt(request);

        expect(result.status).toBe("pass");
        expect(result.semanticScore).toBe(92);
        expect(result.rubricScore).toBe(88);
        expect(result.overallScore).toBe(90);
        expect(result.validation.passed).toBe(true);
        expect(result.metrics.tokens.total).toBe(1500);
        expect(result.metrics.costUsd).toBeGreaterThan(0);
    });

    it("fails when structured validation fails even with a high score", async () => {
        const { evaluatePrompt } = await import("@/server/services/evaluation-service");

        getResponseMock.mockResolvedValue({
            text: "plain text",
            usage: { inputTokens: 10, outputTokens: 10, totalTokens: 20 },
        });
        getEmbeddingMock
            .mockResolvedValueOnce([1, 0])
            .mockResolvedValueOnce([1, 0]);
        getSemanticScoreMock.mockResolvedValue(95);
        getRubricScoresMock.mockResolvedValue([]);

        const [result] = await evaluatePrompt({
            systemPrompt: "Prompt",
            userInput: "{{input}}",
            testCases: [
                {
                    id: "tc-1",
                    input: "Say hi",
                    expectedOutput: '{"answer":"hi"}',
                    outputValidation: { type: "json" },
                },
            ],
            batchSize: 1,
            threshold: 85,
        });

        expect(result.status).toBe("fail");
        expect(result.validation.enabled).toBe(true);
        expect(result.validation.passed).toBe(false);
    });

    it("falls back to a failed result when an underlying call throws", async () => {
        const { evaluatePrompt } = await import("@/server/services/evaluation-service");

        getResponseMock.mockRejectedValue(new Error("Bedrock unavailable"));
        getEmbeddingMock.mockResolvedValue([1, 0]);

        const [result] = await evaluatePrompt({
            systemPrompt: "Prompt",
            userInput: "User input",
            testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi" }],
            batchSize: 1,
            threshold: 85,
        });

        expect(result.status).toBe("fail");
        expect(result.error).toBe("Bedrock unavailable");
        expect(result.metrics.tokens.total).toBe(0);
        expect(result.rubricResults).toEqual([]);
    });

    it("batches work and clamps rubric weighting into the overall score", async () => {
        const { evaluatePrompt } = await import("@/server/services/evaluation-service");

        getResponseMock
            .mockResolvedValueOnce({
                text: "first",
                usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            })
            .mockResolvedValueOnce({
                text: "second",
                usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            });
        getEmbeddingMock
            .mockResolvedValueOnce([1, 0])
            .mockResolvedValueOnce([1, 0])
            .mockResolvedValueOnce([1, 0])
            .mockResolvedValueOnce([1, 0]);
        getSemanticScoreMock
            .mockResolvedValueOnce(80)
            .mockResolvedValueOnce(60);

        const rubrics: RubricDefinition[] = [
            { id: "accuracy", name: "Accuracy", description: "Correctness", weight: 3, enabled: true },
            { id: "tone", name: "Tone", description: "Tone", weight: 1, enabled: true },
        ];

        getRubricScoresMock
            .mockResolvedValueOnce([
                { rubricId: "accuracy", name: "Accuracy", score: 90, weight: 3, reasoning: "Great" },
                { rubricId: "tone", name: "Tone", score: 50, weight: 1, reasoning: "Okay" },
            ])
            .mockResolvedValueOnce([
                { rubricId: "accuracy", name: "Accuracy", score: 40, weight: 3, reasoning: "Weak" },
                { rubricId: "tone", name: "Tone", score: 20, weight: 1, reasoning: "Weak" },
            ]);

        const results = await evaluatePrompt({
            systemPrompt: "Prompt",
            userInput: "{{input}}",
            testCases: [
                { id: "tc-1", input: "one", expectedOutput: "first" },
                { id: "tc-2", input: "two", expectedOutput: "second" },
            ],
            batchSize: 1,
            threshold: 70,
            rubrics,
        });

        expect(results).toHaveLength(2);
        expect(getResponseMock).toHaveBeenCalledTimes(2);
        expect(results[0].rubricScore).toBe(80);
        expect(results[0].overallScore).toBe(80);
        expect(results[0].status).toBe("pass");
        expect(results[1].overallScore).toBe(47.5);
        expect(results[1].status).toBe("fail");
    });
});
