import { generateText } from 'ai';
import { getModel } from './ai';
import { extractJson, clamp } from '@/shared/lib/utils';
import { RubricDefinition, RubricResult } from '@/shared/types';

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

interface RubricEvaluationResponse {
    rubricResults: Array<{
        rubricId: string;
        score: number;
        reasoning: string;
    }>;
}

export async function getRubricScores(
    responseText: string,
    expectedOutput: string,
    rubrics: RubricDefinition[]
): Promise<RubricResult[]> {
    const enabledRubrics = rubrics.filter((rubric) => rubric.enabled);

    if (enabledRubrics.length === 0) {
        return [];
    }

    const prompt = `
        Evaluate an LLM response against the expected output using the provided scoring rubrics.

        RESPONSE:
        """${responseText}"""

        EXPECTED OUTPUT:
        """${expectedOutput}"""

        RUBRICS:
        ${enabledRubrics.map((rubric) => `- id: ${rubric.id}\n  name: ${rubric.name}\n  description: ${rubric.description}`).join('\n')}

        Instructions:
        1. Score each rubric from 0 to 100.
        2. Be strict about missing requirements, contradictions, and weak compliance.
        3. Keep each reasoning short and specific.
        4. Return only valid JSON in this exact shape:
        {
          "rubricResults": [
            { "rubricId": "accuracy", "score": 82, "reasoning": "..." }
          ]
        }
    `;

    try {
        const { text } = await generateText({
            model,
            prompt,
            temperature: 0,
        });

        const payload = extractJson<RubricEvaluationResponse>(text);
        return enabledRubrics.map((rubric) => {
            const matchedResult = payload.rubricResults.find((item) => item.rubricId === rubric.id);

            return {
                rubricId: rubric.id,
                name: rubric.name,
                weight: rubric.weight,
                score: clamp(matchedResult?.score ?? 0, 0, 100),
                reasoning: matchedResult?.reasoning || "No rubric reasoning returned.",
            };
        });
    } catch (error) {
        console.error('Rubric scoring error:', error);
        return enabledRubrics.map((rubric) => ({
            rubricId: rubric.id,
            name: rubric.name,
            weight: rubric.weight,
            score: 0,
            reasoning: 'Rubric scoring failed.',
        }));
    }
}
