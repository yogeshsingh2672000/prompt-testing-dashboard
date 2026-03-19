import { NextResponse } from 'next/server';
import { getGenerateTestCasesErrorStatus } from '@/server/services/api-errors';
import { parseGenerateTestCasesRequest } from '@/server/services/request-validation';
import { generateTestCases } from '@/server/services/test-case-generator-service';

export async function POST(req: Request) {
  try {
    const { sampleInput, systemPrompt, count, providerId, modelId } = parseGenerateTestCasesRequest(await req.json());
    const testCases = await generateTestCases(systemPrompt, sampleInput, count, { providerId, modelId });

    return NextResponse.json({ testCases });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate test cases';
    const status = getGenerateTestCasesErrorStatus(message);

    return NextResponse.json({ error: message }, { status });
  }
}
