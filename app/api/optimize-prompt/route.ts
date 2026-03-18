import { NextResponse } from 'next/server';
import { optimizePrompt } from '@/server/services/prompt-optimizer-service';
import { OptimizePromptRequest } from '@/shared/types';

export async function POST(req: Request) {
  try {
    const request = await req.json() as OptimizePromptRequest;
    const suggestions = await optimizePrompt(request);

    return NextResponse.json(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to optimize prompt';
    const status = message === 'Current prompt is required' || message === 'Evaluation results are required' ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
