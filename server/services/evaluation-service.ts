import { getEmbedding, getResponse } from '@/server/lib/ai';
import { getSemanticScore } from '@/server/lib/evaluator';
import { validateStructuredOutput } from '@/server/services/output-validation';
import { DEFAULT_MODEL_ID, SUPPORTED_MODELS } from '@/shared/constants/models';
import { clamp, chunk, cosineSimilarity, templateReplace } from '@/shared/lib/utils';
import { EvaluationRequest, EvaluationResult, PerformanceMetrics } from '@/shared/types';

export async function evaluatePrompt(request: EvaluationRequest): Promise<EvaluationResult[]> {
    const { systemPrompt, userInput, testCases, batchSize, threshold, modelId } = request;

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

    const selectedModelId = modelId || DEFAULT_MODEL_ID;
    const modelMetadata = SUPPORTED_MODELS.find((model) => model.id === selectedModelId) || SUPPORTED_MODELS[1];
    const batches = chunk(sanitizedTestCases, safeBatchSize);
    const allResults: EvaluationResult[] = [];

    for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(async (testCase) => {
            const startTime = Date.now();

            try {
                const finalSystemPrompt = templateReplace(systemPrompt, testCase.variables || {});
                const finalUserInput = templateReplace(userInput, testCase.variables || {});

                const [llmResult, expectedEmbedding] = await Promise.all([
                    getResponse(finalSystemPrompt, `${finalUserInput}\n\nContext: ${testCase.input}`, selectedModelId),
                    getEmbedding(testCase.expectedOutput),
                ]);

                const latencyMs = Date.now() - startTime;
                const responseText = llmResult.text;
                const usage = llmResult.usage;

                const [responseEmbedding, semanticScore] = await Promise.all([
                    getEmbedding(responseText),
                    getSemanticScore(responseText, testCase.expectedOutput),
                ]);
                const validation = validateStructuredOutput(responseText, testCase.outputValidation);

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
                        (promptTokens / 1_000_000) * modelMetadata.pricing.inputPer1M +
                        (completionTokens / 1_000_000) * modelMetadata.pricing.outputPer1M,
                };

                return {
                    testCaseId: testCase.id,
                    response: responseText,
                    similarity,
                    semanticScore,
                    status: semanticScore >= safeThreshold && validation.passed ? 'pass' : 'fail',
                    metrics,
                    validation,
                } satisfies EvaluationResult;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Unknown evaluation error';

                return {
                    testCaseId: testCase.id,
                    response: '',
                    similarity: 0,
                    semanticScore: 0,
                    status: 'fail',
                    metrics: {
                        latencyMs: Date.now() - startTime,
                        tokens: { prompt: 0, completion: 0, total: 0 },
                        costUsd: 0,
                    },
                    validation: {
                        type: testCase.outputValidation?.type || 'none',
                        enabled: Boolean(testCase.outputValidation && testCase.outputValidation.type !== 'none'),
                        passed: false,
                        message,
                    },
                    error: message,
                } satisfies EvaluationResult;
            }
        }));

        allResults.push(...batchResults);
    }

    return allResults;
}
