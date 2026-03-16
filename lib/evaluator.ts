import { generateText } from 'ai';
import { model } from './ai';

export async function getSemanticScore(responseText: string, expectedOutput: string): Promise<number> {
    const prompt = `
        Evaluate the semantic similarity between an LLM response and an expected output for a recruitment bot.
        
        LLM Response: "${responseText}"
        Expected Output: "${expectedOutput}"
        
        Instructions:
        1. Ignore conversational fluff (e.g., "I understood", "Please let me know").
        2. Focus on whether the core intent and information match.
        3. For example, if both are asking to confirm "Assistant Section Officer", the similarity is 100%.
        4. Provide only a number between 0 and 100 representing the similarity percentage.
        
        Score (0-100):
    `;

    try {
        const { text } = await generateText({
            model,
            prompt,
            temperature: 0,
        });

        const score = parseInt(text.trim());
        return isNaN(score) ? 0 : score;
    } catch (error) {
        console.error('Semantic scoring error:', error);
        return 0;
    }
}
