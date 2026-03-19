export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    variables?: Record<string, string>;
    outputValidation?: OutputValidationConfig;
    conversation?: ConversationTurn[];
}

export type ConversationTurnRole = "user" | "assistant" | "tool";

export interface ConversationTurn {
    id: string;
    role: ConversationTurnRole;
    content: string;
}

export type OutputValidationType = "none" | "json" | "contains" | "starts_with" | "regex";

export interface OutputValidationConfig {
    type: OutputValidationType;
    value?: string;
}

export interface RubricDefinition {
    id: string;
    name: string;
    description: string;
    weight: number;
    enabled: boolean;
}

export interface RubricResult {
    rubricId: string;
    name: string;
    score: number;
    weight: number;
    reasoning: string;
}

export type ReviewDecision = "pending" | "approved" | "rejected";

export interface CaseReview {
    testCaseId: string;
    decision: ReviewDecision;
    note: string;
    overrideStatus?: "pass" | "fail";
    reviewedAt: number;
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
    rubricScore: number;
    overallScore: number;
    status: 'pass' | 'fail';
    metrics: PerformanceMetrics;
    validation: OutputValidationResult;
    rubricResults: RubricResult[];
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
    rubrics?: RubricDefinition[];
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
    avgRubricScore: number;
    avgOverallScore: number;
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
    overallDelta: number;
    semanticDelta: number;
    similarityDelta: number;
    winner: "left" | "right" | "tie";
}

export interface TrendPoint {
    label: string;
    timestamp: number;
    passRate: number;
    avgOverall: number;
    avgSemantic: number;
    avgRubric: number;
    avgLatencyMs: number;
    totalCostUsd: number;
}

export interface RubricAnalyticsPoint {
    rubricId: string;
    name: string;
    averageScore: number;
    sampleCount: number;
}

export interface ModelLeaderboardEntry {
    modelId: string;
    runCount: number;
    avgOverall: number;
    passRate: number;
    avgLatencyMs: number;
    totalCostUsd: number;
}

export interface RegressionSummary {
    hasBaseline: boolean;
    passRateDelta: number;
    avgOverallDelta: number;
    avgLatencyDelta: number;
    totalCostDelta: number;
    newlyFailingCases: string[];
}
