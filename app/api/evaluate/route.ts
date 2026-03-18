import { NextResponse } from 'next/server';
import { evaluatePrompt } from '@/server/services/evaluation-service';
import { EvaluationRequest } from '@/shared/types';

export async function POST(req: Request) {
    try {
        const body: EvaluationRequest = await req.json();
        const results = await evaluatePrompt(body);

        return NextResponse.json(results);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Evaluation failed';
        const status =
            message === 'System prompt is required' ||
            message === 'At least one test case is required' ||
            message === 'No valid test cases were provided'
                ? 400
                : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
