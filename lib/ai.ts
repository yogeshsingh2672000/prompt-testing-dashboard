import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText, embed } from 'ai';
import { SUPPORTED_MODELS, DEFAULT_MODEL_ID } from '@/constants/models';

export function getModel(modelId?: string) {
  return bedrock(modelId || DEFAULT_MODEL_ID);
}


export async function getResponse(systemPrompt: string, userInput: string, modelId?: string) {
  const selectedModelId = modelId || DEFAULT_MODEL_ID;
  const model = bedrock(selectedModelId);

  return generateText({
    model,
    system: systemPrompt,
    prompt: userInput,
  });
}

export async function getEmbedding(text: string) {
  const embeddingModel = bedrock.embedding('amazon.titan-embed-text-v2:0');
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}
