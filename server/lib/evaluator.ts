import { generateText } from 'ai';
import { getModel } from './ai';
import { clamp } from '@/shared/lib/utils';

const model = getModel();

export async function getSemanticScore(responseText: string, expectedOutput: string): Promise<number> {
    const prompt = `
        Evaluate how well an LLM response matches an expected output for a prompt-evaluation tool.

        LLM Response: "${responseText}"
        Expected Output: "${expectedOutput}"

        Instructions:
        1. Ignore conversational filler and stylistic differences unless they change meaning.
        2. Focus on whether the response preserves the expected intent, constraints, and critical facts.
        3. Penalize contradictions, missing required actions, hallucinated details, or safety failures.
        4. Return only one integer from 0 to 100.

        Score (0-100):
    `;

    try {
        const { text } = await generateText({
            model,
            prompt,
            temperature: 0,
        });

        const match = text.match(/\d{1,3}/);
        if (!match) {
            return 0;
        }

        return clamp(Number.parseInt(match[0], 10), 0, 100);
    } catch (error) {
        console.error('Semantic scoring error:', error);
        return 0;
    }
}
