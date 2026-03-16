import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText, embed } from 'ai';

export const model = bedrock('anthropic.claude-3-sonnet-20240229-v1:0');
export const embeddingModel = bedrock.embedding('amazon.titan-embed-text-v2:0');

export async function getResponse(systemPrompt: string, userInput: string) {
  return generateText({
    model,
    // system: systemPrompt?.trim() ? systemPrompt : undefined,
    system: systemPrompt,
    prompt: userInput,
  });
}

export async function getEmbedding(text: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}
