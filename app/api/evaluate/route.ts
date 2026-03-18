import { NextResponse } from 'next/server';
import { getEvaluationErrorStatus } from '@/server/services/api-errors';
import { parseEvaluationRequest } from '@/server/services/request-validation';
import { evaluatePrompt } from '@/server/services/evaluation-service';

export async function POST(req: Request) {
    try {
        const body = parseEvaluationRequest(await req.json());
        const results = await evaluatePrompt(body);

        return NextResponse.json(results);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Evaluation failed';
        const status = getEvaluationErrorStatus(message);

        return NextResponse.json({ error: message }, { status });
    }
}
