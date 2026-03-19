import { beforeEach, describe, expect, it, vi } from "vitest";

const evaluatePromptMock = vi.fn();
const generateTestCasesMock = vi.fn();
const optimizePromptMock = vi.fn();
const compareEvaluationRequestsMock = vi.fn();

vi.mock("@/server/services/evaluation-service", () => ({
    evaluatePrompt: evaluatePromptMock,
}));

vi.mock("@/server/services/test-case-generator-service", () => ({
    generateTestCases: generateTestCasesMock,
}));

vi.mock("@/server/services/prompt-optimizer-service", () => ({
    optimizePrompt: optimizePromptMock,
}));

vi.mock("@/server/services/compare-service", () => ({
    compareEvaluationRequests: compareEvaluationRequestsMock,
}));

describe("API routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns evaluation results for a valid evaluate request", async () => {
        const { POST } = await import("@/app/api/evaluate/route");
        evaluatePromptMock.mockResolvedValue([{ testCaseId: "tc-1", status: "pass" }]);

        const response = await POST(new Request("http://localhost/api/evaluate", {
            method: "POST",
            body: JSON.stringify({
                systemPrompt: "Prompt",
                userInput: "{{input}}",
                testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi" }],
                batchSize: 1,
                threshold: 80,
            }),
        }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual([{ testCaseId: "tc-1", status: "pass" }]);
        expect(evaluatePromptMock).toHaveBeenCalledTimes(1);
    });

    it("returns a 400 response for invalid evaluate payloads", async () => {
        const { POST } = await import("@/app/api/evaluate/route");

        const response = await POST(new Request("http://localhost/api/evaluate", {
            method: "POST",
            body: JSON.stringify({ systemPrompt: "Prompt" }),
        }));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: "Evaluation request is missing required fields",
        });
    });

    it("maps generation errors to the expected status codes", async () => {
        const { POST } = await import("@/app/api/generate-test-cases/route");
        generateTestCasesMock.mockRejectedValue(new Error("No valid test cases were generated"));

        const response = await POST(new Request("http://localhost/api/generate-test-cases", {
            method: "POST",
            body: JSON.stringify({
                systemPrompt: "Prompt",
                sampleInput: "Hello",
                count: 4,
            }),
        }));

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
            error: "No valid test cases were generated",
        });
    });

    it("returns generated test cases when the payload is valid", async () => {
        const { POST } = await import("@/app/api/generate-test-cases/route");
        generateTestCasesMock.mockResolvedValue([{ input: "hello", expectedOutput: "hi" }]);

        const response = await POST(new Request("http://localhost/api/generate-test-cases", {
            method: "POST",
            body: JSON.stringify({
                systemPrompt: "Prompt",
                sampleInput: "Hello",
                count: 2,
            }),
        }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            testCases: [{ input: "hello", expectedOutput: "hi" }],
        });
        expect(generateTestCasesMock).toHaveBeenCalledWith("Prompt", "Hello", 2, {
            providerId: undefined,
            modelId: undefined,
        });
    });

    it("returns prompt optimization suggestions when the payload is valid", async () => {
        const { POST } = await import("@/app/api/optimize-prompt/route");
        optimizePromptMock.mockResolvedValue({
            optimizedPrompt: "Better prompt",
            reasoning: "Adds clarity",
        });

        const response = await POST(new Request("http://localhost/api/optimize-prompt", {
            method: "POST",
            body: JSON.stringify({
                currentPrompt: "Prompt",
                results: [{ testCaseId: "tc-1", response: "hello" }],
            }),
        }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            optimizedPrompt: "Better prompt",
            reasoning: "Adds clarity",
        });
    });

    it("maps optimization validation failures to 400", async () => {
        const { POST } = await import("@/app/api/optimize-prompt/route");
        optimizePromptMock.mockRejectedValue(new Error("Current prompt is required"));

        const response = await POST(new Request("http://localhost/api/optimize-prompt", {
            method: "POST",
            body: JSON.stringify({
                currentPrompt: "",
                results: [],
            }),
        }));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Current prompt is required",
        });
    });

    it("returns comparison payloads from the compare route", async () => {
        const { POST } = await import("@/app/api/compare/route");
        compareEvaluationRequestsMock.mockResolvedValue({
            leftResults: [],
            rightResults: [],
            summary: { left: { passRate: 100 }, right: { passRate: 50 } },
            cases: [],
        });

        const response = await POST(new Request("http://localhost/api/compare", {
            method: "POST",
            body: JSON.stringify({
                left: {
                    systemPrompt: "Prompt",
                    userInput: "{{input}}",
                    testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi" }],
                    batchSize: 1,
                    threshold: 80,
                },
                right: {
                    systemPrompt: "Prompt",
                    userInput: "{{input}}",
                    testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi" }],
                    batchSize: 1,
                    threshold: 80,
                },
            }),
        }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            leftResults: [],
            rightResults: [],
            summary: { left: { passRate: 100 }, right: { passRate: 50 } },
            cases: [],
        });
    });
});
