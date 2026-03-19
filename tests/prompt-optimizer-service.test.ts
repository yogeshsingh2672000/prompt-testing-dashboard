import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EvaluationResult } from "@/shared/types";

const generateTextMock = vi.fn();
const getModelMock = vi.fn();

vi.mock("ai", () => ({
    generateText: generateTextMock,
}));

vi.mock("@/server/lib/ai", () => ({
    getModel: getModelMock,
}));

const results: EvaluationResult[] = [
    {
        testCaseId: "a",
        response: "great response",
        similarity: 95,
        semanticScore: 95,
        rubricScore: 90,
        overallScore: 93,
        status: "pass",
        metrics: { latencyMs: 100, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.01 },
        validation: { type: "none", enabled: false, passed: true, message: "" },
        rubricResults: [],
    },
    {
        testCaseId: "b",
        response: "okay response",
        similarity: 72,
        semanticScore: 72,
        rubricScore: 70,
        overallScore: 71,
        status: "pass",
        metrics: { latencyMs: 100, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.01 },
        validation: { type: "none", enabled: false, passed: true, message: "" },
        rubricResults: [],
    },
    {
        testCaseId: "c",
        response: "weak response",
        similarity: 34,
        semanticScore: 34,
        rubricScore: 40,
        overallScore: 37,
        status: "fail",
        metrics: { latencyMs: 100, tokens: { prompt: 1, completion: 1, total: 2 }, costUsd: 0.01 },
        validation: { type: "none", enabled: false, passed: true, message: "" },
        rubricResults: [],
    },
];

describe("optimizePrompt", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getModelMock.mockReturnValue({ id: "optimizer-model" });
    });

    it("validates required inputs", async () => {
        const { optimizePrompt } = await import("@/server/services/prompt-optimizer-service");

        await expect(optimizePrompt({ currentPrompt: "", results })).rejects.toThrow("Current prompt is required");
        await expect(optimizePrompt({ currentPrompt: "Prompt", results: [] })).rejects.toThrow("Evaluation results are required");
    });

    it("uses the selected model and returns parsed optimization suggestions", async () => {
        const { optimizePrompt } = await import("@/server/services/prompt-optimizer-service");

        generateTextMock.mockResolvedValue({
            text: '```json\n{"optimizedPrompt":"New prompt","reasoning":"More specific instructions"}\n```',
        });

        const suggestion = await optimizePrompt({
            currentPrompt: "Current prompt",
            results,
            modelId: "anthropic.custom",
        });

        expect(getModelMock).toHaveBeenCalledWith({
            providerId: undefined,
            modelId: "anthropic.custom",
        });
        expect(generateTextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                model: { id: "optimizer-model" },
                temperature: 0.2,
                prompt: expect.stringContaining("HIGH SCORING EXAMPLES"),
            })
        );
        expect(generateTextMock.mock.calls[0][0].prompt).toContain("great response");
        expect(generateTextMock.mock.calls[0][0].prompt).toContain("weak response");
        expect(suggestion).toEqual({
            optimizedPrompt: "New prompt",
            reasoning: "More specific instructions",
        });
    });
});
