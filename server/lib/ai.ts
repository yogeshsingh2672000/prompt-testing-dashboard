import { embed, generateText } from "ai";
import { resolveEmbeddingSelection, resolveLanguageSelection, ProviderModelSelection } from "@/server/lib/provider-registry";
import { getProviderAdapter } from "@/server/lib/provider-registry";

export function getModel(selection?: ProviderModelSelection) {
    const resolved = resolveLanguageSelection(selection);
    return getProviderAdapter(resolved.providerId).languageModel(resolved.modelId);
}

export async function getResponse(
    systemPrompt: string,
    userInput: string,
    selection?: ProviderModelSelection
) {
    const model = getModel(selection);

    return generateText({
        model,
        system: systemPrompt,
        prompt: userInput,
    });
}

export async function getEmbedding(text: string, selection?: ProviderModelSelection) {
    const resolved = resolveEmbeddingSelection(selection);
    const adapter = getProviderAdapter(resolved.providerId);

    if (!adapter.embeddingModel) {
        throw new Error(`Provider "${resolved.providerId}" does not support embeddings.`);
    }

    const { embedding } = await embed({
        model: adapter.embeddingModel(resolved.modelId),
        value: text,
    });

    return embedding;
}
