export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    variables?: Record<string, string>;
    outputValidation?: OutputValidationConfig;
}

export type OutputValidationType = "none" | "json" | "contains" | "starts_with" | "regex";

export interface OutputValidationConfig {
    type: OutputValidationType;
    value?: string;
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
    validation: OutputValidationResult;
    error?: string;
}

export interface OutputValidationResult {
    type: OutputValidationType;
    enabled: boolean;
    passed: boolean;
    message: string;
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

export interface ComparisonSubject {
    id: string;
    name: string;
    modelId?: string;
}

export interface ComparisonMetricsSummary {
    avgSimilarity: number;
    avgSemanticScore: number;
    passRate: number;
    totalCostUsd: number;
    avgLatencyMs: number;
}

export interface ComparisonCaseResult {
    testCaseId: string;
    input: string;
    expectedOutput: string;
    left: EvaluationResult;
    right: EvaluationResult;
    semanticDelta: number;
    similarityDelta: number;
    winner: "left" | "right" | "tie";
}
