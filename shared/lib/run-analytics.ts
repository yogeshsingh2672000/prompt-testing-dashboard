import { PromptVersion, TestRun } from "@/shared/lib/persistence";
import { ModelLeaderboardEntry, RegressionSummary, RubricAnalyticsPoint, TrendPoint } from "@/shared/types";

function average(values: number[]) {
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function buildTrendPoints(runs: TestRun[], limit = 12): TrendPoint[] {
    return [...runs]
        .sort((left, right) => left.timestamp - right.timestamp)
        .slice(-limit)
        .map((run) => ({
            label: new Date(run.timestamp).toLocaleDateString(),
            timestamp: run.timestamp,
            passRate: run.metrics.passRate,
            avgOverall: run.metrics.avgOverall,
            avgSemantic: run.metrics.avgSemantic,
            avgRubric: run.metrics.avgRubric,
            avgLatencyMs: average(run.results.map((result) => result.metrics.latencyMs)),
            totalCostUsd: run.results.reduce((sum, result) => sum + result.metrics.costUsd, 0),
        }));
}

export function buildRubricAnalytics(runs: TestRun[]): RubricAnalyticsPoint[] {
    const buckets = new Map<string, { name: string; scores: number[] }>();

    runs.forEach((run) => {
        run.results.forEach((result) => {
            result.rubricResults.forEach((rubric) => {
                const entry = buckets.get(rubric.rubricId) || { name: rubric.name, scores: [] };
                entry.scores.push(rubric.score);
                buckets.set(rubric.rubricId, entry);
            });
        });
    });

    return Array.from(buckets.entries())
        .map(([rubricId, entry]) => ({
            rubricId,
            name: entry.name,
            averageScore: average(entry.scores),
            sampleCount: entry.scores.length,
        }))
        .sort((left, right) => right.averageScore - left.averageScore);
}

export function buildModelLeaderboard(runs: TestRun[]): ModelLeaderboardEntry[] {
    const buckets = new Map<string, TestRun[]>();

    runs.forEach((run) => {
        const modelId = run.config.modelId || "unknown";
        const entry = buckets.get(modelId) || [];
        entry.push(run);
        buckets.set(modelId, entry);
    });

    return Array.from(buckets.entries())
        .map(([modelId, modelRuns]) => ({
            modelId,
            runCount: modelRuns.length,
            avgOverall: average(modelRuns.map((run) => run.metrics.avgOverall)),
            passRate: average(modelRuns.map((run) => run.metrics.passRate)),
            avgLatencyMs: average(modelRuns.flatMap((run) => run.results.map((result) => result.metrics.latencyMs))),
            totalCostUsd: modelRuns.reduce(
                (sum, run) => sum + run.results.reduce((runSum, result) => runSum + result.metrics.costUsd, 0),
                0
            ),
        }))
        .sort((left, right) => right.avgOverall - left.avgOverall);
}

export function findBaselineRun(
    runs: TestRun[],
    currentRun: TestRun,
    baselinePromptVersionId?: string
): TestRun | undefined {
    return [...runs]
        .filter((run) => run.id !== currentRun.id)
        .filter((run) => (baselinePromptVersionId ? run.promptVersionId === baselinePromptVersionId : true))
        .filter((run) => (currentRun.suiteId ? run.suiteId === currentRun.suiteId : true))
        .sort((left, right) => right.timestamp - left.timestamp)[0];
}

export function buildRegressionSummary(currentRun: TestRun, baselineRun?: TestRun): RegressionSummary {
    if (!baselineRun) {
        return {
            hasBaseline: false,
            passRateDelta: 0,
            avgOverallDelta: 0,
            avgLatencyDelta: 0,
            totalCostDelta: 0,
            newlyFailingCases: [],
        };
    }

    const baselineStatuses = new Map(baselineRun.results.map((result) => [result.testCaseId, result.status]));
    const newlyFailingCases = currentRun.results
        .filter((result) => result.status === "fail" && baselineStatuses.get(result.testCaseId) === "pass")
        .map((result) => result.testCaseId);

    return {
        hasBaseline: true,
        passRateDelta: currentRun.metrics.passRate - baselineRun.metrics.passRate,
        avgOverallDelta: currentRun.metrics.avgOverall - baselineRun.metrics.avgOverall,
        avgLatencyDelta:
            average(currentRun.results.map((result) => result.metrics.latencyMs)) -
            average(baselineRun.results.map((result) => result.metrics.latencyMs)),
        totalCostDelta:
            currentRun.results.reduce((sum, result) => sum + result.metrics.costUsd, 0) -
            baselineRun.results.reduce((sum, result) => sum + result.metrics.costUsd, 0),
        newlyFailingCases,
    };
}

export function resolveBaselinePromptVersionId(
    suiteId: string | undefined,
    versions: PromptVersion[],
    globalBaselinePromptVersionId: string | undefined,
    baselinePromptVersionIdsBySuite: Record<string, string>
) {
    if (suiteId && baselinePromptVersionIdsBySuite[suiteId]) {
        return versions.find((version) => version.id === baselinePromptVersionIdsBySuite[suiteId])?.id;
    }

    if (globalBaselinePromptVersionId) {
        return versions.find((version) => version.id === globalBaselinePromptVersionId)?.id;
    }

    return undefined;
}
