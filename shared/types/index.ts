export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    variables?: Record<string, string>;
}

export interface PerformanceMetrics {
    latencyMs: number;
    tokens: {
        prompt: number;
        completion: number;
        total: number;
    };
    costUsd: number;
}

export interface EvaluationResult {
    testCaseId: string;
    response: string;
    similarity: number;
    semanticScore: number;
    status: 'pass' | 'fail';
    metrics: PerformanceMetrics;
    error?: string;
}

export interface EvaluationRequest {
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    batchSize: number;
    threshold: number;
    modelId?: string;
}

export interface GeneratedTestCasePayload {
    input: string;
    expectedOutput: string;
}

export interface OptimizePromptRequest {
    currentPrompt: string;
    results: EvaluationResult[];
    modelId?: string;
}

export interface PromptOptimizationSuggestion {
    optimizedPrompt: string;
    reasoning: string;
}
