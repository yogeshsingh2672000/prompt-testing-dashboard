import { beforeEach, describe, expect, it, vi } from "vitest";

const generateTextMock = vi.fn();
const getModelMock = vi.fn();

vi.mock("ai", () => ({
    generateText: generateTextMock,
}));

vi.mock("@/server/lib/ai", () => ({
    getModel: getModelMock,
}));

describe("generateTestCases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getModelMock.mockReturnValue({ id: "mock-model" });
    });

    it("validates the required system prompt", async () => {
        const { generateTestCases } = await import("@/server/services/test-case-generator-service");

        await expect(generateTestCases("", "sample", 3)).rejects.toThrow("System prompt is required");
        expect(generateTextMock).not.toHaveBeenCalled();
    });

    it("sanitizes generated test cases and clamps the requested count", async () => {
        const { generateTestCases } = await import("@/server/services/test-case-generator-service");

        generateTextMock.mockResolvedValue({
            text: `Here you go:
            [
              {"input":"  first  ","expectedOutput":"  one  "},
              {"input":"second","expectedOutput":"two"},
              {"input":"","expectedOutput":"skip"},
              {"input":"bad","expectedOutput":1}
            ]`,
        });

        const testCases = await generateTestCases("System prompt", "Sample", 99);

        expect(testCases).toEqual([
            { input: "first", expectedOutput: "one" },
            { input: "second", expectedOutput: "two" },
        ]);
        expect(getModelMock).toHaveBeenCalledTimes(1);
        expect(generateTextMock).toHaveBeenCalledWith(
            expect.objectContaining({
                model: { id: "mock-model" },
                temperature: 0.3,
                prompt: expect.stringContaining("generate 20 diverse and challenging test cases"),
            })
        );
    });

    it("throws when no valid test cases are generated", async () => {
        const { generateTestCases } = await import("@/server/services/test-case-generator-service");

        generateTextMock.mockResolvedValue({
            text: '[{"input":" ","expectedOutput":" "}]',
        });

        await expect(generateTestCases("Prompt", "Sample", 1)).rejects.toThrow("No valid test cases were generated");
    });
});
