import { EvaluationResult, TestCase } from "@/shared/types";

/**
 * Converts evaluation results to a CSV string
 */
export function resultsToCSV(results: EvaluationResult[], testCases: TestCase[]): string {
    const headers = [
        "Test Case ID",
        "Input",
        "Expected Output",
        "LLM Response",
        "Status",
        "Similarity (%)",
        "Semantic Score (%)",
        "Latency (ms)",
        "Prompt Tokens",
        "Completion Tokens",
        "Total Tokens",
        "Cost (USD)"
    ];

    const rows = results.map(result => {
        const testCase = testCases.find(tc => tc.id === result.testCaseId);
        return [
            result.testCaseId,
            `"${(testCase?.input || "").replace(/"/g, '""')}"`,
            `"${(testCase?.expectedOutput || "").replace(/"/g, '""')}"`,
            `"${(result.response || "").replace(/"/g, '""')}"`,
            result.status,
            result.similarity.toFixed(2),
            result.semanticScore.toFixed(0),
            result.metrics?.latencyMs || 0,
            result.metrics?.tokens.prompt || 0,
            result.metrics?.tokens.completion || 0,
            result.metrics?.tokens.total || 0,
            result.metrics?.costUsd.toFixed(6) || 0
        ];
    });

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

/**
 * Triggers a browser download of a file
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
