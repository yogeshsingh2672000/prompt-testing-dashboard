import { bedrock } from "@ai-sdk/amazon-bedrock";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { EmbeddingModelV3, LanguageModelV3 } from "@ai-sdk/provider";
import {
    DEFAULT_PROVIDER_ID,
    SUPPORTED_EMBEDDING_MODELS,
    getModelsByProvider,
    resolveProviderId,
    resolveProviderModelSelection,
} from "@/shared/constants/models";
import { LLMProviderId } from "@/shared/types";

interface ProviderAdapter {
    id: LLMProviderId;
    supportsEmbeddings: boolean;
    isConfigured: () => boolean;
    languageModel: (modelId: string) => LanguageModelV3;
    embeddingModel?: (modelId: string) => EmbeddingModelV3;
}

const providerRegistry: Record<LLMProviderId, ProviderAdapter> = {
    bedrock: {
        id: "bedrock",
        supportsEmbeddings: true,
        isConfigured: () => Boolean(process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION),
        languageModel: (modelId) => bedrock(modelId),
        embeddingModel: (modelId) => bedrock.embedding(modelId),
    },
    openai: {
        id: "openai",
        supportsEmbeddings: true,
        isConfigured: () => Boolean(process.env.OPENAI_API_KEY),
        languageModel: (modelId) => openai(modelId),
        embeddingModel: (modelId) => openai.embedding(modelId),
    },
    anthropic: {
        id: "anthropic",
        supportsEmbeddings: false,
        isConfigured: () => Boolean(process.env.ANTHROPIC_API_KEY),
        languageModel: (modelId) => anthropic(modelId),
    },
    google: {
        id: "google",
        supportsEmbeddings: true,
        isConfigured: () => Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
        languageModel: (modelId) => google(modelId),
        embeddingModel: (modelId) => google.textEmbeddingModel(modelId),
    },
};

export interface ProviderModelSelection {
    providerId?: LLMProviderId;
    modelId?: string;
}

export interface EmbeddingSelection {
    providerId?: LLMProviderId;
    modelId?: string;
}

export function getProviderAdapter(providerId: LLMProviderId) {
    return providerRegistry[providerId];
}

export function getConfiguredProviders() {
    return (Object.keys(providerRegistry) as LLMProviderId[]).filter((providerId) =>
        providerRegistry[providerId].isConfigured()
    );
}

export function getConfiguredProvidersSet() {
    return new Set(getConfiguredProviders());
}

export function resolveLanguageSelection(selection?: ProviderModelSelection) {
    const resolved = resolveProviderModelSelection(selection?.modelId, selection?.providerId);
    const adapter = getProviderAdapter(resolved.providerId);

    if (!adapter.isConfigured()) {
        const fallbackProviderId = getConfiguredProviders()[0] || DEFAULT_PROVIDER_ID;
        const fallbackModelId = getModelsByProvider(fallbackProviderId)[0]?.id || resolved.modelId;
        return {
            providerId: fallbackProviderId,
            modelId: fallbackModelId,
        };
    }

    return resolved;
}

export function resolveEmbeddingSelection(selection?: EmbeddingSelection) {
    const preferredProviderId = resolveProviderId(selection?.modelId, selection?.providerId);
    const preferredAdapter = getProviderAdapter(preferredProviderId);

    if (preferredAdapter.supportsEmbeddings && preferredAdapter.isConfigured()) {
        const embeddingModel = SUPPORTED_EMBEDDING_MODELS.find((model) => model.providerId === preferredProviderId);
        if (embeddingModel) {
            return {
                providerId: preferredProviderId,
                modelId: embeddingModel.id,
            };
        }
    }

    const configuredProviders = getConfiguredProvidersSet();
    const fallbackEmbeddingModel = SUPPORTED_EMBEDDING_MODELS.find((model) => configuredProviders.has(model.providerId))
        || SUPPORTED_EMBEDDING_MODELS[0];

    return {
        providerId: fallbackEmbeddingModel.providerId,
        modelId: fallbackEmbeddingModel.id,
    };
}
