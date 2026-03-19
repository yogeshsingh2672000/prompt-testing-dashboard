import { summarizeEvaluationResults } from "@/shared/lib/evaluation-summary";
import { TestRun } from "@/shared/lib/persistence";
import { EvaluationResult, RubricDefinition, TestCase } from "@/shared/types";

interface BuildTestRunInput {
    name: string;
    systemPrompt: string;
    userInput: string;
    testCases: TestCase[];
    results: EvaluationResult[];
    batchSize: number;
    threshold: number;
    modelId?: string;
    rubrics: RubricDefinition[];
    suiteId?: string;
    promptVersionId?: string;
    triggerSource?: TestRun["triggerSource"];
    scheduleId?: string;
    baselinePromptVersionId?: string;
    metadata?: TestRun["metadata"];
}

export function buildTestRun(input: BuildTestRunInput): TestRun {
    const summary = summarizeEvaluationResults(input.results);

    return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        name: input.name,
        suiteId: input.suiteId,
        promptVersionId: input.promptVersionId,
        systemPrompt: input.systemPrompt,
        userInput: input.userInput,
        testCases: input.testCases,
        results: input.results,
        triggerSource: input.triggerSource || "workspace",
        scheduleId: input.scheduleId,
        baselinePromptVersionId: input.baselinePromptVersionId,
        metadata: input.metadata,
        config: {
            batchSize: input.batchSize,
            threshold: input.threshold,
            modelId: input.modelId,
            rubrics: input.rubrics,
        },
        metrics: {
            avgSimilarity: summary.avgSimilarity,
            avgSemantic: summary.avgSemantic,
            avgRubric: summary.avgRubric,
            avgOverall: summary.avgOverall,
            passRate: summary.passRate,
            totalCases: summary.totalCases,
            passedCases: summary.passedCases,
            validationPassRate:
                input.results.length > 0
                    ? (input.results.filter((result) => result.validation.passed).length / input.results.length) * 100
                    : 0,
        },
    };
}
