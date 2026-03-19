import { getEmbedding, getResponse } from '@/server/lib/ai';
import { getRubricScores, getSemanticScore } from '@/server/lib/evaluator';
import { createFallbackEvaluationResult } from '@/shared/lib/evaluation-factories';
import { validateStructuredOutput } from '@/server/services/output-validation';
import { getModelDefinition, resolveProviderModelSelection } from '@/shared/constants/models';
import { calculateOverallScore, calculateRubricScore } from '@/shared/lib/evaluation-summary';
import { clamp, chunk, cosineSimilarity, templateReplace } from '@/shared/lib/utils';
import { EvaluationRequest, EvaluationResult, PerformanceMetrics } from '@/shared/types';

function buildEvaluationPrompt(userInputTemplate: string, testCase: EvaluationRequest["testCases"][number]) {
    const finalUserInput = templateReplace(userInputTemplate, testCase.variables || {});

    if (testCase.conversation && testCase.conversation.length > 0) {
        const transcript = testCase.conversation
            .map((turn, index) => `${index + 1}. ${turn.role.toUpperCase()}: ${turn.content}`)
            .join("\n");

        return [
            finalUserInput,
            "",
            "Conversation Transcript:",
            transcript,
            testCase.input ? `Final Scenario Goal: ${testCase.input}` : "",
        ]
            .filter(Boolean)
            .join("\n");
    }

    return `${finalUserInput}\n\nContext: ${testCase.input}`;
}

export async function evaluatePrompt(request: EvaluationRequest): Promise<EvaluationResult[]> {
    const { systemPrompt, userInput, testCases, batchSize, threshold, modelId, providerId, rubrics = [] } = request;

    if (!systemPrompt?.trim()) {
        throw new Error('System prompt is required');
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new Error('At least one test case is required');
    }

    const safeBatchSize = clamp(Number(batchSize) || 1, 1, 20);
    const safeThreshold = clamp(Number(threshold) || 0, 0, 100);
    const sanitizedTestCases = testCases.filter(
        (testCase) =>
            testCase &&
            typeof testCase.id === 'string' &&
            typeof testCase.input === 'string' &&
            typeof testCase.expectedOutput === 'string' &&
            testCase.expectedOutput.trim().length > 0
    );

    if (sanitizedTestCases.length === 0) {
        throw new Error('No valid test cases were provided');
    }

    const selection = resolveProviderModelSelection(modelId, providerId);
    const modelMetadata = getModelDefinition(selection.modelId);
    const batches = chunk(sanitizedTestCases, safeBatchSize);
    const allResults: EvaluationResult[] = [];

    for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(async (testCase) => {
            const startTime = Date.now();

            try {
                const finalSystemPrompt = templateReplace(systemPrompt, testCase.variables || {});
                const finalUserInput = buildEvaluationPrompt(userInput, testCase);

                const [llmResult, expectedEmbedding] = await Promise.all([
                    getResponse(finalSystemPrompt, finalUserInput, selection),
                    getEmbedding(testCase.expectedOutput, selection),
                ]);

                const latencyMs = Date.now() - startTime;
                const responseText = llmResult.text;
                const usage = llmResult.usage;

                const [responseEmbedding, semanticScore, rubricResults] = await Promise.all([
                    getEmbedding(responseText, selection),
                    getSemanticScore(responseText, testCase.expectedOutput, selection),
                    getRubricScores(responseText, testCase.expectedOutput, rubrics, selection),
                ]);
                const validation = validateStructuredOutput(responseText, testCase.outputValidation);
                const rubricScore = calculateRubricScore(semanticScore, rubricResults);
                const overallScore = calculateOverallScore(semanticScore, rubricScore, rubricResults);

                const similarity = clamp(cosineSimilarity(responseEmbedding, expectedEmbedding) * 100, 0, 100);
                const promptTokens = usage?.inputTokens ?? 0;
                const completionTokens = usage?.outputTokens ?? 0;
                const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;

                const metrics: PerformanceMetrics = {
                    latencyMs,
                    tokens: {
                        prompt: promptTokens,
                        completion: completionTokens,
                        total: totalTokens,
                    },
                    costUsd:
                        ((promptTokens / 1_000_000) * (modelMetadata?.pricing.inputPer1M || 0)) +
                        ((completionTokens / 1_000_000) * (modelMetadata?.pricing.outputPer1M || 0)),
                };

                return {
                    testCaseId: testCase.id,
                    response: responseText,
                    similarity,
                    semanticScore,
                    rubricScore,
                    overallScore,
                    status: overallScore >= safeThreshold && validation.passed ? 'pass' : 'fail',
                    metrics,
                    validation,
                    rubricResults,
                } satisfies EvaluationResult;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Unknown evaluation error';

                return createFallbackEvaluationResult({
                    testCaseId: testCase.id,
                    message,
                    validationType: testCase.outputValidation?.type || 'none',
                    validationEnabled: Boolean(testCase.outputValidation && testCase.outputValidation.type !== 'none'),
                    latencyMs: Date.now() - startTime,
                });
            }
        }));

        allResults.push(...batchResults);
    }

    return allResults;
}
