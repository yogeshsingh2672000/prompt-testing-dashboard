"use client";

import { useState } from "react";
import { RubricDefinition, TestCase, EvaluationResult, EvaluationRequest } from "@/shared/types";
import { persistence, TestRun } from "@/shared/lib/persistence";

export function useEvaluation(
    testCases: TestCase[],
    systemPrompt: string,
    userInput: string,
    batchSize: number,
    threshold: number,
    modelId?: string,
    rubrics: RubricDefinition[] = [],
    onError?: (message: string) => void
) {
    const [results, setResults] = useState<EvaluationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runEvaluation = async () => {
        const hasValidTestCase = testCases.some(
            (testCase) => testCase.input.trim().length > 0 && testCase.expectedOutput.trim().length > 0
        );

        if (!systemPrompt.trim()) {
            const message = "Add a system prompt before running an evaluation.";
            setError(message);
            onError?.(message);
            return;
        }

        if (!hasValidTestCase) {
            const message = "Add at least one test case with both input and expected output.";
            setError(message);
            onError?.(message);
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);
        try {
            const response = await fetch("/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt,
                    userInput,
                    testCases,
                    batchSize,
                    threshold,
                    modelId,
                    rubrics,
                } as EvaluationRequest),
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(typeof payload?.error === "string" ? payload.error : "Evaluation failed");
            }

            const data = payload as EvaluationResult[];
            setResults(data);

            // Save to persistence
            if (data.length > 0) {
                const passCount = data.filter(r => r.status === 'pass').length;
                const avgSimilarity = data.reduce((sum, r) => sum + r.similarity, 0) / data.length;
                const avgSemantic = data.reduce((sum, r) => sum + r.semanticScore, 0) / data.length;
                const avgRubric = data.reduce((sum, r) => sum + r.rubricScore, 0) / data.length;
                const avgOverall = data.reduce((sum, r) => sum + r.overallScore, 0) / data.length;

                const run: TestRun = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    name: `Run ${new Date().toLocaleString()}`,
                    systemPrompt,
                    userInput,
                    testCases,
                    results: data,
                    config: { batchSize, threshold, modelId, rubrics },
                    metrics: {
                        avgSimilarity,
                        avgSemantic,
                        avgRubric,
                        avgOverall,
                        passRate: (passCount / data.length) * 100,
                        totalCases: data.length,
                        passedCases: passCount
                    }
                };
                await persistence.saveRun(run);
                window.dispatchEvent(new CustomEvent("promitly:runs-updated"));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Evaluation failed";
            console.error("Evaluation failed", error);
            setError(message);
            onError?.(message);
        } finally {
            setLoading(false);
        }
    };

    return {
        results,
        loading,
        error,
        runEvaluation,
        setResults,
        setError
    };
}
