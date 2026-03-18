import { ComparisonMetricsSummary, EvaluationResult, RubricResult } from "@/shared/types";

export function calculateRubricScore(semanticScore: number, rubricResults: RubricResult[]): number {
    const enabledRubricWeight = rubricResults.reduce((sum, rubric) => sum + rubric.weight, 0);

    if (enabledRubricWeight === 0) {
        return semanticScore;
    }

    return rubricResults.reduce((sum, rubric) => sum + rubric.score * rubric.weight, 0) / enabledRubricWeight;
}

export function calculateOverallScore(semanticScore: number, rubricScore: number, rubricResults: RubricResult[]): number {
    return rubricResults.length > 0 ? (semanticScore + rubricScore) / 2 : semanticScore;
}

export interface EvaluationRunSummary {
    avgSimilarity: number;
    avgSemantic: number;
    avgRubric: number;
    avgOverall: number;
    passRate: number;
    totalCases: number;
    passedCases: number;
}

export function summarizeEvaluationResults(results: EvaluationResult[]): EvaluationRunSummary {
    if (results.length === 0) {
        return {
            avgSimilarity: 0,
            avgSemantic: 0,
            avgRubric: 0,
            avgOverall: 0,
            passRate: 0,
            totalCases: 0,
            passedCases: 0,
        };
    }

    const passedCases = results.filter((result) => result.status === "pass").length;

    return {
        avgSimilarity: results.reduce((sum, result) => sum + result.similarity, 0) / results.length,
        avgSemantic: results.reduce((sum, result) => sum + result.semanticScore, 0) / results.length,
        avgRubric: results.reduce((sum, result) => sum + result.rubricScore, 0) / results.length,
        avgOverall: results.reduce((sum, result) => sum + result.overallScore, 0) / results.length,
        passRate: (passedCases / results.length) * 100,
        totalCases: results.length,
        passedCases,
    };
}

export function toComparisonMetricsSummary(results: EvaluationResult[]): ComparisonMetricsSummary {
    const summary = summarizeEvaluationResults(results);

    return {
        avgSimilarity: summary.avgSimilarity,
        avgSemanticScore: summary.avgSemantic,
        avgRubricScore: summary.avgRubric,
        avgOverallScore: summary.avgOverall,
        passRate: summary.passRate,
        totalCostUsd: results.reduce((sum, result) => sum + result.metrics.costUsd, 0),
        avgLatencyMs: results.length > 0
            ? results.reduce((sum, result) => sum + result.metrics.latencyMs, 0) / results.length
            : 0,
    };
}
