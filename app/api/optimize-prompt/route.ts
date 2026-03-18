import { NextResponse } from 'next/server';
import { getOptimizePromptErrorStatus } from '@/server/services/api-errors';
import { optimizePrompt } from '@/server/services/prompt-optimizer-service';
import { OptimizePromptRequest } from '@/shared/types';

export async function POST(req: Request) {
  try {
    const request = await req.json() as OptimizePromptRequest;
    const suggestions = await optimizePrompt(request);

    return NextResponse.json(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to optimize prompt';
    const status = getOptimizePromptErrorStatus(message);

    return NextResponse.json({ error: message }, { status });
  }
}
