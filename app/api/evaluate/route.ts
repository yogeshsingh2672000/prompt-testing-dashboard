import { NextResponse } from 'next/server';
import { getResponse, getEmbedding } from '@/lib/ai';
import { cosineSimilarity, chunk } from '@/lib/utils';
import { getSemanticScore } from '@/lib/evaluator';
import { EvaluationRequest, EvaluationResult } from '@/types';

export async function POST(req: Request) {
    try {
        const body: EvaluationRequest = await req.json();
        const { systemPrompt, userInput, testCases, batchSize, threshold } = body;

        const batches = chunk(testCases, batchSize);
        const allResults: EvaluationResult[] = [];

        for (const batch of batches) {
            const batchPromises = batch.map(async (testCase) => {
                try {
                    // Process LLM response and Expected Output Embedding in parallel
                    const [llmResult, expectedEmbedding] = await Promise.all([
                        getResponse(systemPrompt, `${userInput}\n\nContext: ${testCase.input}`),
                        getEmbedding(testCase.expectedOutput),
                    ]);

                    const responseText = llmResult.text;

                    // Calculate both Vector Similarity and Semantic Intent Score in parallel
                    const [responseEmbedding, semanticScore] = await Promise.all([
                        getEmbedding(responseText),
                        getSemanticScore(responseText, testCase.expectedOutput)
                    ]);

                    const similarity = cosineSimilarity(responseEmbedding, expectedEmbedding);

                    return {
                        testCaseId: testCase.id,
                        response: responseText,
                        similarity: similarity * 100,
                        semanticScore: semanticScore,
                        status: semanticScore >= threshold ? 'pass' : 'fail',
                    } as EvaluationResult;
                } catch (error: any) {
                    console.error(`Error processing test case ${testCase.id}:`, error);
                    return {
                        testCaseId: testCase.id,
                        response: '',
                        similarity: 0,
                        semanticScore: 0,
                        status: 'fail',
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
