import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getModel } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { currentPrompt, results, modelId } = await req.json();

    const model = getModel(modelId);

    // Filter interesting results (very good vs very bad)
    const sortedResults = [...results].sort((a, b) => b.semanticScore - a.semanticScore);
    const bestExamples = sortedResults.slice(0, 2);
    const worstExamples = sortedResults.slice(-2);

    const prompt = `
      You are an expert Prompt Engineer. Your goal is to optimize a System Prompt based on its performance in evaluation runs.

      CURRENT SYSTEM PROMPT:
      "${currentPrompt}"

      PERFORMANCE DATA:
      ${bestExamples.length > 0 ? `HIGH SCORING EXAMPLES:\n${bestExamples.map(r => `- Input: ${r.response}\n  Reason: High semantic alignment.`).join('\n')}` : ''}
      ${worstExamples.length > 0 ? `LOW SCORING EXAMPLES:\n${worstExamples.map(r => `- Input: ${r.response}\n  Reason: Failed to meet semantic criteria.`).join('\n')}` : ''}

      TASK:
      1. Analyze why the prompt is failing on some inputs.
      2. Suggest an "Optimized Prompt" that addresses these weaknesses while maintaining the strengths.
      3. Provide a brief "Reasoning" for the changes.

      OUTPUT FORMAT (JSON):
      {
        "optimizedPrompt": "...",
        "reasoning": "..."
      }
      Return ONLY the JSON.
    `;

    const { text } = await generateText({
      model,
      prompt,
    });

    const jsonString = text.replace(/```json\n?|```/g, '').trim();
    const suggestions = JSON.parse(jsonString);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return NextResponse.json({ error: 'Failed to optimize prompt' }, { status: 500 });
  }
}
