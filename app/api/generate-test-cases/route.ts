import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getModel } from '@/lib/ai';
import { extractJson } from '@/lib/utils';
import { GeneratedTestCasePayload } from '@/types';

export async function POST(req: Request) {
  try {
    const { sampleInput, systemPrompt, count = 5 } = await req.json();
    const requestedCount = Number.isFinite(count) ? Math.min(Math.max(Number(count), 1), 20) : 5;

    if (!systemPrompt?.trim()) {
      return NextResponse.json({ error: 'System prompt is required' }, { status: 400 });
    }

    const model = getModel();

    const prompt = `
      You are an expert QA and Prompt Engineer.
      Given the following System Prompt and a Sample Input, generate ${requestedCount} diverse and challenging test cases.
      Each test case must have a representative "input" and an "expectedOutput" that follows the logic of the System Prompt.
      
      Focus on variety:
      1. Edge cases (empty inputs, very long inputs, special characters).
      2. Different tones or intents.
      3. Potential failure points for the current prompt.

      SYSTEM PROMPT:
      "${systemPrompt}"

      SAMPLE INPUT:
      "${sampleInput}"

      Return the response as a valid JSON array of objects with "input" and "expectedOutput" fields.
      DO NOT return any other text or explanation.
    `;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    const rawTestCases = extractJson<GeneratedTestCasePayload[]>(text);
    const testCases = rawTestCases
      .filter((testCase) => typeof testCase?.input === 'string' && typeof testCase?.expectedOutput === 'string')
      .map((testCase) => ({
        input: testCase.input.trim(),
        expectedOutput: testCase.expectedOutput.trim(),
      }))
      .filter((testCase) => testCase.input && testCase.expectedOutput);

    if (testCases.length === 0) {
      return NextResponse.json({ error: 'No valid test cases were generated' }, { status: 502 });
    }

    return NextResponse.json({ testCases });
  } catch (error) {
    console.error('Error generating test cases:', error);
    return NextResponse.json({ error: 'Failed to generate test cases' }, { status: 500 });
  }
}
