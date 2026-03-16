import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getModel } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { sampleInput, systemPrompt, count = 5 } = await req.json();

    const model = getModel();

    const prompt = `
      You are an expert QA and Prompt Engineer.
      Given the following System Prompt and a Sample Input, generate ${count} diverse and challenging test cases.
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
    });

    // Extract JSON if model wraps it in backticks
    const jsonString = text.replace(/```json\n?|```/g, '').trim();
    const testCases = JSON.parse(jsonString);

    return NextResponse.json({ testCases });
  } catch (error) {
    console.error('Error generating test cases:', error);
    return NextResponse.json({ error: 'Failed to generate test cases' }, { status: 500 });
  }
}
