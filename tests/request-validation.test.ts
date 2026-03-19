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
                    conversation: [
                        { id: "turn-1", role: "user", content: "hello" },
                    ],
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
        expect(request.testCases[0].conversation?.[0].role).toBe("user");
        expect(request.rubrics?.[0].id).toBe("accuracy");
    });

    it("normalizes optional evaluation fields and strips invalid nested values", () => {
        const request = parseEvaluationRequest({
            systemPrompt: "You are helpful",
            userInput: "{{input}}",
            testCases: [
                {
                    id: "tc-1",
                    input: "hello",
                    expectedOutput: "hi",
                    variables: {
                        valid: "value",
                        invalid: 1,
                    },
                    outputValidation: { type: "not_real", value: "x" },
                },
            ],
            batchSize: "2",
            threshold: "91",
        });

        expect(request.batchSize).toBe(2);
        expect(request.threshold).toBe(91);
        expect(request.testCases[0].variables).toEqual({ valid: "value" });
        expect(request.testCases[0].outputValidation).toBeUndefined();
    });

    it("rejects malformed evaluation requests", () => {
        expect(() => parseEvaluationRequest(null)).toThrow("Evaluation request payload must be an object");
        expect(() => parseEvaluationRequest({ systemPrompt: "x" })).toThrow("Evaluation request is missing required fields");
        expect(() =>
            parseEvaluationRequest({
                systemPrompt: "x",
                userInput: "y",
                testCases: [null],
            })
        ).toThrow("Test case 1 must be an object");
        expect(() =>
            parseEvaluationRequest({
                systemPrompt: "x",
                userInput: "y",
                testCases: [{ id: "1", input: 1, expectedOutput: "z" }],
            })
        ).toThrow("Test case 1 is missing required string fields");
        expect(() =>
            parseEvaluationRequest({
                systemPrompt: "x",
                userInput: "y",
                testCases: [{ id: "1", input: "ok", expectedOutput: "z" }],
                rubrics: [null],
            })
        ).toThrow("Rubric 1 must be an object");
        expect(() =>
            parseEvaluationRequest({
                systemPrompt: "x",
                userInput: "y",
                testCases: [{ id: "1", input: "ok", expectedOutput: "z" }],
                rubrics: [{ id: "r", name: "R", description: "D", weight: "1", enabled: true }],
            })
        ).toThrow("Rubric 1 is invalid");
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
            results: [
                {
                    testCaseId: "tc-1",
                    response: "hello",
                    status: "pass",
                    validation: { type: "contains" },
                    metrics: {},
                },
            ],
        });
        expect(optimization.currentPrompt).toBe("Prompt");
        expect(optimization.results).toHaveLength(1);
        expect(optimization.results[0].status).toBe("pass");
        expect(optimization.results[0].metrics.tokens.total).toBe(0);
        expect(optimization.results[0].validation.type).toBe("contains");
        expect(optimization.results[0].validation.passed).toBe(true);
    });

    it("rejects malformed generation and optimization payloads", () => {
        expect(() => parseGenerateTestCasesRequest(null)).toThrow("Test case generation payload must be an object");
        expect(() => parseGenerateTestCasesRequest({ sampleInput: "hello" })).toThrow("System prompt is required");
        expect(() => parseOptimizePromptRequest(null)).toThrow("Optimize prompt payload must be an object");
        expect(() => parseOptimizePromptRequest({ currentPrompt: "Prompt" })).toThrow("Optimize prompt request is missing required fields");
        expect(() => parseOptimizePromptRequest({
            currentPrompt: "Prompt",
            results: [null],
        })).toThrow("Evaluation result 1 is invalid");
        expect(() => parseEvaluationRequest({
            systemPrompt: "x",
            userInput: "y",
            testCases: [{ id: "1", input: "ok", expectedOutput: "z", conversation: [{ id: "turn-1", role: "bogus", content: "x" }] }],
        })).toThrow("Conversation turn 1 is invalid");
    });
});
