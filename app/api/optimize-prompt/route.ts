import { NextResponse } from 'next/server';
import { getOptimizePromptErrorStatus } from '@/server/services/api-errors';
import { optimizePrompt } from '@/server/services/prompt-optimizer-service';
import { parseOptimizePromptRequest } from '@/server/services/request-validation';

export async function POST(req: Request) {
  try {
    const request = parseOptimizePromptRequest(await req.json());
    const suggestions = await optimizePrompt(request);

    return NextResponse.json(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to optimize prompt';
    const status = getOptimizePromptErrorStatus(message);

    return NextResponse.json({ error: message }, { status });
  }
}
