"use client";

import { useState } from "react";
import { TestCase, EvaluationResult, EvaluationRequest } from "@/types";
import { persistence, TestRun } from "@/lib/persistence";

export function useEvaluation(testCases: TestCase[], systemPrompt: string, userInput: string, batchSize: number, threshold: number, modelId?: string) {
    const [results, setResults] = useState<EvaluationResult[]>([]);
    const [loading, setLoading] = useState(false);

    const runEvaluation = async () => {
        setLoading(true);
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
                    modelId
                } as EvaluationRequest),
            });
            const data: EvaluationResult[] = await response.json();
            setResults(data);

            // Save to persistence
            if (data.length > 0) {
                const passCount = data.filter(r => r.status === 'pass').length;
                const avgSimilarity = data.reduce((sum, r) => sum + r.similarity, 0) / data.length;
                const avgSemantic = data.reduce((sum, r) => sum + r.semanticScore, 0) / data.length;

                const run: TestRun = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    name: `Run ${new Date().toLocaleString()}`,
                    systemPrompt,
                    userInput,
                    testCases,
                    results: data,
                    config: { batchSize, threshold, modelId },
                    metrics: {
                        avgSimilarity,
                        avgSemantic,
                        passRate: (passCount / data.length) * 100,
                        totalCases: data.length,
                        passedCases: passCount
                    }
                };
                await persistence.saveRun(run);
            }
        } catch (error) {
            console.error("Evaluation failed", error);
        } finally {
            setLoading(false);
        }
    };

    return {
        results,
        loading,
        runEvaluation,
        setResults
    };
}
