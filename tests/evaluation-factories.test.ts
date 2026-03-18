import { describe, expect, it } from "vitest";
import { createDefaultCaseReview, createFallbackEvaluationResult } from "@/shared/lib/evaluation-factories";

describe("evaluation factories", () => {
    it("creates a fallback evaluation result", () => {
        const result = createFallbackEvaluationResult({
            testCaseId: "tc-1",
            message: "Model failed",
            validationType: "json",
            validationEnabled: true,
            latencyMs: 123,
        });

        expect(result.testCaseId).toBe("tc-1");
        expect(result.status).toBe("fail");
        expect(result.validation.type).toBe("json");
        expect(result.validation.enabled).toBe(true);
        expect(result.validation.message).toBe("Model failed");
        expect(result.metrics.latencyMs).toBe(123);
        expect(result.rubricResults).toEqual([]);
    });

    it("creates a default pending case review", () => {
        const review = createDefaultCaseReview("tc-2");

        expect(review).toEqual({
            testCaseId: "tc-2",
            decision: "pending",
            note: "",
            reviewedAt: 0,
        });
    });
});
