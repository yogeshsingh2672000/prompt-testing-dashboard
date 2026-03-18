import { CaseReview, EvaluationResult, RubricDefinition, TestCase } from "@/shared/types";

export interface TestCaseSuite {
    id: string;
    name: string;
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    rubrics: RubricDefinition[];
    versionCount?: number;
    createdAt: number;
    updatedAt: number;
}

export interface PromptVersion {
    id: string;
    name: string;
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    rubrics: RubricDefinition[];
    modelId?: string;
    threshold: number;
    batchSize: number;
    suiteId?: string;
    createdAt: number;
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
    reviews?: Record<string, CaseReview>;
    config: {
        batchSize: number;
        threshold: number;
        modelId?: string;
        rubrics: RubricDefinition[];
    };
    metrics: {
        avgSimilarity: number;
        avgSemantic: number;
        avgRubric: number;
        avgOverall: number;
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

    // Prompt versions
    savePromptVersion(version: PromptVersion): Promise<void>;
    getPromptVersions(): Promise<PromptVersion[]>;
    getPromptVersion(id: string): Promise<PromptVersion | undefined>;
    deletePromptVersion(id: string): Promise<void>;

    // Helpers
    clearAll(): Promise<void>;
}
