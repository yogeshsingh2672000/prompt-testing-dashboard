import { CaseReview, EvaluationResult, LLMProviderId, RubricDefinition, TestCase } from "@/shared/types";

export interface AppSettings {
    id: "app_settings";
    defaultProviderId?: LLMProviderId;
    defaultModelId?: string;
    defaultBatchSize: number;
    defaultThreshold: number;
    defaultRubrics: RubricDefinition[];
    rubricPresetId?: string;
    globalBaselinePromptVersionId?: string;
    baselinePromptVersionIdsBySuite: Record<string, string>;
    updatedAt: number;
}

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
    providerId?: LLMProviderId;
    modelId?: string;
    threshold: number;
    batchSize: number;
    suiteId?: string;
    createdAt: number;
}

export type RunTriggerSource = "workspace" | "compare" | "schedule" | "api";

export interface TestRun {
    id: string;
    suiteId?: string;
    promptVersionId?: string;
    name: string;
    timestamp: number;
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    results: EvaluationResult[];
    reviews?: Record<string, CaseReview>;
    triggerSource?: RunTriggerSource;
    scheduleId?: string;
    baselinePromptVersionId?: string;
    metadata?: {
        suiteName?: string;
        promptVersionName?: string;
    };
    config: {
        batchSize: number;
        threshold: number;
        providerId?: LLMProviderId;
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
        validationPassRate?: number;
    };
}

export interface ScheduledEvaluation {
    id: string;
    name: string;
    suiteId?: string;
    promptVersionId?: string;
    providerId?: LLMProviderId;
    modelId?: string;
    batchSize: number;
    threshold: number;
    rubrics: RubricDefinition[];
    cadenceHours: number;
    enabled: boolean;
    createdAt: number;
    updatedAt: number;
    lastRunAt?: number;
    nextRunAt?: number;
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

    // Schedules
    saveSchedule(schedule: ScheduledEvaluation): Promise<void>;
    getSchedules(): Promise<ScheduledEvaluation[]>;
    getSchedule(id: string): Promise<ScheduledEvaluation | undefined>;
    deleteSchedule(id: string): Promise<void>;

    // Settings
    saveSettings(settings: AppSettings): Promise<void>;
    getSettings(): Promise<AppSettings | undefined>;
    clearSettings(): Promise<void>;

    // Helpers
    clearAll(): Promise<void>;
}
