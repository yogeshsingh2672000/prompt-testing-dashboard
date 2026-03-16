"use client";

import { useState } from "react";
import { TestCase, EvaluationResult, EvaluationRequest } from "@/types";

export function useEvaluation(testCases: TestCase[], systemPrompt: string, userInput: string, batchSize: number, threshold: number) {
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
                } as EvaluationRequest),
            });
            const data = await response.json();
            setResults(data);
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
