import { NextResponse } from 'next/server';
import { getGenerateTestCasesErrorStatus } from '@/server/services/api-errors';
import { generateTestCases } from '@/server/services/test-case-generator-service';

export async function POST(req: Request) {
  try {
    const { sampleInput, systemPrompt, count = 5 } = await req.json();
    const testCases = await generateTestCases(systemPrompt, sampleInput, count);

    return NextResponse.json({ testCases });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate test cases';
    const status = getGenerateTestCasesErrorStatus(message);

    return NextResponse.json({ error: message }, { status });
  }
}
