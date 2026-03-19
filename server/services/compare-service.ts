import { createFallbackEvaluationResult } from "@/shared/lib/evaluation-factories";
import { toComparisonMetricsSummary } from "@/shared/lib/evaluation-summary";
import { ComparisonCaseResult, EvaluationRequest } from "@/shared/types";
import { evaluatePrompt } from "@/server/services/evaluation-service";

export interface CompareRequestsInput {
    left: EvaluationRequest;
    right: EvaluationRequest;
}

export async function compareEvaluationRequests({ left, right }: CompareRequestsInput) {
    const [leftResults, rightResults] = await Promise.all([
        evaluatePrompt(left),
        evaluatePrompt(right),
    ]);

    const rightResultsMap = new Map(rightResults.map((result) => [result.testCaseId, result]));

    const cases: ComparisonCaseResult[] = left.testCases.map((testCase) => {
        const fallbackResult = createFallbackEvaluationResult({
            testCaseId: testCase.id,
            validationType: testCase.outputValidation?.type || "none",
            validationEnabled: Boolean(testCase.outputValidation && testCase.outputValidation.type !== "none"),
        });

        const leftResult = leftResults.find((result) => result.testCaseId === testCase.id) || fallbackResult;
        const rightResult = rightResultsMap.get(testCase.id) || fallbackResult;

        const overallDelta = leftResult.overallScore - rightResult.overallScore;
        const semanticDelta = leftResult.semanticScore - rightResult.semanticScore;
        const similarityDelta = leftResult.similarity - rightResult.similarity;
        const winner =
            overallDelta === 0
                ? semanticDelta === 0
                    ? similarityDelta === 0
                        ? "tie"
                        : similarityDelta > 0
                            ? "left"
                            : "right"
                    : semanticDelta > 0
                        ? "left"
                        : "right"
                : overallDelta > 0
                    ? "left"
                    : "right";

        return {
            testCaseId: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            left: leftResult,
            right: rightResult,
            overallDelta,
            semanticDelta,
            similarityDelta,
            winner,
        };
    });

    return {
        leftResults,
        rightResults,
        summary: {
            left: toComparisonMetricsSummary(leftResults),
            right: toComparisonMetricsSummary(rightResults),
        },
        cases,
    };
}
