import { describe, expect, it } from "vitest";
import {
    parseEvaluationRequest,
    parseGenerateTestCasesRequest,
    parseOptimizePromptRequest,
} from "@/server/services/request-validation";

describe("request validation", () => {
    it("parses a valid evaluation request", () => {
        const request = parseEvaluationRequest({
            systemPrompt: "You are helpful",
            userInput: "{{input}}",
            testCases: [
                {
                    id: "tc-1",
                    input: "hello",
                    expectedOutput: "hi",
                    outputValidation: { type: "contains", value: "hi" },
                },
            ],
            batchSize: 3,
            threshold: 90,
            rubrics: [
                {
                    id: "accuracy",
                    name: "Accuracy",
                    description: "Check correctness",
                    weight: 3,
                    enabled: true,
                },
            ],
        });

        expect(request.batchSize).toBe(3);
        expect(request.testCases[0].outputValidation?.type).toBe("contains");
        expect(request.rubrics?.[0].id).toBe("accuracy");
    });

    it("rejects malformed evaluation requests", () => {
        expect(() => parseEvaluationRequest(null)).toThrow("Evaluation request payload must be an object");
        expect(() => parseEvaluationRequest({ systemPrompt: "x" })).toThrow("Evaluation request is missing required fields");
        expect(() =>
            parseEvaluationRequest({
                systemPrompt: "x",
                userInput: "y",
                testCases: [{ id: "1", input: 1, expectedOutput: "z" }],
            })
        ).toThrow("Test case 1 is missing required string fields");
    });

    it("parses generation and optimization payloads", () => {
        const generation = parseGenerateTestCasesRequest({
            systemPrompt: "Prompt",
            sampleInput: "hello",
            count: "6",
        });
        expect(generation.count).toBe(6);

        const optimization = parseOptimizePromptRequest({
            currentPrompt: "Prompt",
            results: [{ testCaseId: "tc-1", response: "hello" }],
        });
        expect(optimization.currentPrompt).toBe("Prompt");
        expect(optimization.results).toHaveLength(1);
    });

    it("rejects malformed generation and optimization payloads", () => {
        expect(() => parseGenerateTestCasesRequest({ sampleInput: "hello" })).toThrow("System prompt is required");
        expect(() => parseOptimizePromptRequest({ currentPrompt: "Prompt" })).toThrow("Optimize prompt request is missing required fields");
    });
});
