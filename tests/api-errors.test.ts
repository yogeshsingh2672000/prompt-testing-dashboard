import { describe, expect, it } from "vitest";
import {
    getEvaluationErrorStatus,
    getGenerateTestCasesErrorStatus,
    getOptimizePromptErrorStatus,
} from "@/server/services/api-errors";

describe("api error status helpers", () => {
    it("maps evaluation validation errors to 400", () => {
        expect(getEvaluationErrorStatus("System prompt is required")).toBe(400);
        expect(getEvaluationErrorStatus("At least one test case is required")).toBe(400);
        expect(getEvaluationErrorStatus("No valid test cases were provided")).toBe(400);
    });

    it("maps generation errors to expected statuses", () => {
        expect(getGenerateTestCasesErrorStatus("System prompt is required")).toBe(400);
        expect(getGenerateTestCasesErrorStatus("No valid test cases were generated")).toBe(502);
        expect(getGenerateTestCasesErrorStatus("Something else")).toBe(500);
    });

    it("maps optimization validation errors to 400", () => {
        expect(getOptimizePromptErrorStatus("Current prompt is required")).toBe(400);
        expect(getOptimizePromptErrorStatus("Evaluation results are required")).toBe(400);
        expect(getOptimizePromptErrorStatus("Unexpected failure")).toBe(500);
    });
});
