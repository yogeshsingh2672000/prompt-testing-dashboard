"use client";

import { useState } from "react";
import { RubricDefinition, TestCase, EvaluationResult, EvaluationRequest } from "@/shared/types";
import { persistence, TestRun } from "@/shared/lib/persistence";
import { buildTestRun } from "@/shared/lib/run-records";

interface EvaluationRunMetadata {
    suiteId?: string;
    promptVersionId?: string;
    triggerSource?: TestRun["triggerSource"];
    baselinePromptVersionId?: string;
    runName?: string;
    metadata?: TestRun["metadata"];
}

export function useEvaluation(
    testCases: TestCase[],
    systemPrompt: string,
    userInput: string,
    batchSize: number,
    threshold: number,
    modelId?: string,
    rubrics: RubricDefinition[] = [],
    onError?: (message: string) => void,
    runMetadata?: EvaluationRunMetadata
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
                const run: TestRun = buildTestRun({
                    name: runMetadata?.runName || `Run ${new Date().toLocaleString()}`,
                    suiteId: runMetadata?.suiteId,
                    promptVersionId: runMetadata?.promptVersionId,
                    systemPrompt,
                    userInput,
                    testCases,
                    results: data,
                    batchSize,
                    threshold,
                    modelId,
                    rubrics,
                    triggerSource: runMetadata?.triggerSource,
                    baselinePromptVersionId: runMetadata?.baselinePromptVersionId,
                    metadata: runMetadata?.metadata,
                });
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
