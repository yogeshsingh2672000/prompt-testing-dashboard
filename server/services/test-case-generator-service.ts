import { generateText } from 'ai';
import { getModel } from '@/server/lib/ai';
import { extractJson } from '@/shared/lib/utils';
import { GeneratedTestCasePayload } from '@/shared/types';

export async function generateTestCases(systemPrompt: string, sampleInput: string, count = 5): Promise<GeneratedTestCasePayload[]> {
    const requestedCount = Number.isFinite(count) ? Math.min(Math.max(Number(count), 1), 20) : 5;

    if (!systemPrompt?.trim()) {
        throw new Error('System prompt is required');
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
        throw new Error('No valid test cases were generated');
    }

    return testCases;
}
