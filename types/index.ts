export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
}

export interface EvaluationResult {
    testCaseId: string;
    response: string;
    similarity: number;
    semanticScore: number;
    status: 'pass' | 'fail';
    error?: string;
}

export interface EvaluationRequest {
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    batchSize: number;
    threshold: number;
}
