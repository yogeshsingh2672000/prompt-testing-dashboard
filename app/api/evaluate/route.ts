import { NextResponse } from 'next/server';
import { getResponse, getEmbedding } from '@/lib/ai';
import { cosineSimilarity, chunk, templateReplace } from '@/lib/utils';
import { getSemanticScore } from '@/lib/evaluator';
import { EvaluationRequest, EvaluationResult, PerformanceMetrics } from '@/types';
import { SUPPORTED_MODELS, DEFAULT_MODEL_ID } from '@/constants/models';

export async function POST(req: Request) {
    try {
        const body: EvaluationRequest = await req.json();
        const { systemPrompt, userInput, testCases, batchSize, threshold, modelId } = body;

        const selectedModelId = modelId || DEFAULT_MODEL_ID;
        const modelMetadata = SUPPORTED_MODELS.find(m => m.id === selectedModelId) || SUPPORTED_MODELS[1];

        const batches = chunk(testCases, batchSize);
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

                    const similarity = cosineSimilarity(responseEmbedding, expectedEmbedding);

                    // Calculate Cost (Using any to bypass lint for dynamic usage properties)
                    const u = usage as any;
                    const promptTokens = u.promptTokens || 0;
                    const completionTokens = u.completionTokens || 0;
                    const totalTokens = u.totalTokens || 0;

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
                        similarity: similarity * 100,
                        semanticScore: semanticScore,
                        status: semanticScore >= threshold ? 'pass' : 'fail',
                        metrics
                    } as EvaluationResult;
                } catch (error: any) {
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
                        error: error.message,
                    } as EvaluationResult;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            allResults.push(...batchResults);
        }

        return NextResponse.json(allResults);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
