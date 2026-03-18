import { CaseReview, EvaluationResult, OutputValidationType, RubricResult } from "@/shared/types";

function createEmptyRubricResults(): RubricResult[] {
    return [];
}

export function createFallbackEvaluationResult(options: {
    testCaseId: string;
    message?: string;
    validationType?: OutputValidationType;
    validationEnabled?: boolean;
    latencyMs?: number;
}): EvaluationResult {
    const {
        testCaseId,
        message = "No evaluation result was returned for this test case.",
        validationType = "none",
        validationEnabled = false,
        latencyMs = 0,
    } = options;

    return {
        testCaseId,
        response: "",
        similarity: 0,
        semanticScore: 0,
        rubricScore: 0,
        overallScore: 0,
        status: "fail",
        metrics: {
            latencyMs,
            tokens: { prompt: 0, completion: 0, total: 0 },
            costUsd: 0,
        },
        validation: {
            type: validationType,
            enabled: validationEnabled,
            passed: false,
            message,
        },
        rubricResults: createEmptyRubricResults(),
        error: message,
    };
}

export function createDefaultCaseReview(testCaseId: string): CaseReview {
    return {
        testCaseId,
        decision: "pending",
        note: "",
        reviewedAt: 0,
    };
}
