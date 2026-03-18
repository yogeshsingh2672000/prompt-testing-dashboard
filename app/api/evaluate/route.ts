import { NextResponse } from 'next/server';
import { getEvaluationErrorStatus } from '@/server/services/api-errors';
import { evaluatePrompt } from '@/server/services/evaluation-service';
import { EvaluationRequest } from '@/shared/types';

export async function POST(req: Request) {
    try {
        const body: EvaluationRequest = await req.json();
        const results = await evaluatePrompt(body);

        return NextResponse.json(results);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Evaluation failed';
        const status = getEvaluationErrorStatus(message);

        return NextResponse.json({ error: message }, { status });
    }
}
