import { EvaluationResult, TestCase } from "@/shared/types";

export interface TestCaseSuite {
    id: string;
    name: string;
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    createdAt: number;
    updatedAt: number;
}

export interface TestRun {
    id: string;
    suiteId?: string;
    name: string;
    timestamp: number;
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    results: EvaluationResult[];
    config: {
        batchSize: number;
        threshold: number;
        modelId?: string;
    };
    metrics: {
        avgSimilarity: number;
        avgSemantic: number;
        passRate: number;
        totalCases: number;
        passedCases: number;
    };
}

export interface PersistenceProvider {
    // Runs
    saveRun(run: TestRun): Promise<void>;
    getRuns(): Promise<TestRun[]>;
    getRun(id: string): Promise<TestRun | undefined>;
    deleteRun(id: string): Promise<void>;

    // Suites
    saveSuite(suite: TestCaseSuite): Promise<void>;
    getSuites(): Promise<TestCaseSuite[]>;
    getSuite(id: string): Promise<TestCaseSuite | undefined>;
    deleteSuite(id: string): Promise<void>;

    // Helpers
    clearAll(): Promise<void>;
}
