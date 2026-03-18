import { NextResponse } from 'next/server';
import { getResponse, getEmbedding } from '@/lib/ai';
import { clamp, cosineSimilarity, chunk, templateReplace } from '@/lib/utils';
import { getSemanticScore } from '@/lib/evaluator';
import { EvaluationRequest, EvaluationResult, PerformanceMetrics } from '@/types';
import { SUPPORTED_MODELS, DEFAULT_MODEL_ID } from '@/constants/models';

export async function POST(req: Request) {
    try {
        const body: EvaluationRequest = await req.json();
        const { systemPrompt, userInput, testCases, batchSize, threshold, modelId } = body;

        if (!systemPrompt?.trim()) {
            return NextResponse.json({ error: 'System prompt is required' }, { status: 400 });
        }

        if (!Array.isArray(testCases) || testCases.length === 0) {
            return NextResponse.json({ error: 'At least one test case is required' }, { status: 400 });
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
            return NextResponse.json({ error: 'No valid test cases were provided' }, { status: 400 });
        }

        const selectedModelId = modelId || DEFAULT_MODEL_ID;
        const modelMetadata = SUPPORTED_MODELS.find((m) => m.id === selectedModelId) || SUPPORTED_MODELS[1];

        const batches = chunk(sanitizedTestCases, safeBatchSize);
        const allResults: EvaluationResult[] = [];

        for (const batch of batches) {
            const batchPromises = batch.map(async (testCase) => {
                const startTime = Date.now();
                try {
                    // Replace variables in prompts
                    const finalSystemPrompt = templateReplace(systemPrompt, testCase.variables || {});
                    const finalUserInput = templateReplace(userInput, testCase.variables || {});

                    // Process LLM response and Expected Output Embedding in parallel
                    const [llmResult, expectedEmbedding] = await Promise.all([
                        getResponse(finalSystemPrompt, `${finalUserInput}\n\nContext: ${testCase.input}`, selectedModelId),
                        getEmbedding(testCase.expectedOutput),
                    ]);

                    const latencyMs = Date.now() - startTime;
                    const responseText = llmResult.text;
                    const usage = llmResult.usage;

                    // Calculate both Vector Similarity and Semantic Intent Score in parallel
                    const [responseEmbedding, semanticScore] = await Promise.all([
                        getEmbedding(responseText),
                        getSemanticScore(responseText, testCase.expectedOutput)
                    ]);

                    const similarity = clamp(cosineSimilarity(responseEmbedding, expectedEmbedding) * 100, 0, 100);

                    const promptTokens = usage?.inputTokens ?? 0;
                    const completionTokens = usage?.outputTokens ?? 0;
                    const totalTokens = usage?.totalTokens ?? promptTokens + completionTokens;

                    const promptCost = (promptTokens / 1000000) * modelMetadata.pricing.inputPer1M;
                    const completionCost = (completionTokens / 1000000) * modelMetadata.pricing.outputPer1M;
                    const totalCostUsd = promptCost + completionCost;

                    const metrics: PerformanceMetrics = {
                        latencyMs,
                        tokens: {
                            prompt: promptTokens,
                            completion: completionTokens,
                            total: totalTokens
                        },
                        costUsd: totalCostUsd
                    };

                    return {
                        testCaseId: testCase.id,
                        response: responseText,
                        similarity,
                        semanticScore: semanticScore,
                        status: semanticScore >= safeThreshold ? 'pass' : 'fail',
                        metrics
                    } as EvaluationResult;
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Unknown evaluation error';
                    console.error(`Error processing test case ${testCase.id}:`, error);
                    return {
                        testCaseId: testCase.id,
                        response: '',
                        similarity: 0,
                        semanticScore: 0,
                        status: 'fail',
                        metrics: {
                            latencyMs: Date.now() - startTime,
                            tokens: { prompt: 0, completion: 0, total: 0 },
                            costUsd: 0
                        },
                        error: message,
                    } as EvaluationResult;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            allResults.push(...batchResults);
        }

        return NextResponse.json(allResults);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Evaluation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
