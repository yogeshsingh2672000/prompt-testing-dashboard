import { bedrock, createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { EmbeddingModelV3, LanguageModelV3 } from "@ai-sdk/provider";
import {
    DEFAULT_PROVIDER_ID,
    SUPPORTED_EMBEDDING_MODELS,
    getModelsByProvider,
    resolveProviderId,
    resolveProviderModelSelection,
} from "@/shared/constants/models";
import { BedrockRuntimeCredentials, LLMProviderId } from "@/shared/types";

interface ProviderAdapter {
    id: LLMProviderId;
    supportsEmbeddings: boolean;
    isConfigured: (apiKey?: string, bedrockCredentials?: BedrockRuntimeCredentials) => boolean;
    languageModel: (modelId: string, apiKey?: string, bedrockCredentials?: BedrockRuntimeCredentials) => LanguageModelV3;
    embeddingModel?: (modelId: string, apiKey?: string, bedrockCredentials?: BedrockRuntimeCredentials) => EmbeddingModelV3;
}

function getBedrockRuntimeProvider(bedrockCredentials?: BedrockRuntimeCredentials) {
    if (!bedrockCredentials) {
        return null;
    }

    const hasRuntimeConfig = Boolean(
        bedrockCredentials.region ||
        bedrockCredentials.accessKeyId ||
        bedrockCredentials.secretAccessKey ||
        bedrockCredentials.sessionToken
    );

    if (!hasRuntimeConfig) {
        return null;
    }

    return createAmazonBedrock({
        region: bedrockCredentials.region,
        accessKeyId: bedrockCredentials.accessKeyId,
        secretAccessKey: bedrockCredentials.secretAccessKey,
        sessionToken: bedrockCredentials.sessionToken,
    });
}

const providerRegistry: Record<LLMProviderId, ProviderAdapter> = {
    bedrock: {
        id: "bedrock",
        supportsEmbeddings: true,
        isConfigured: (_apiKey, bedrockCredentials) =>
            Boolean(bedrockCredentials?.region || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION),
        languageModel: (modelId, _apiKey, bedrockCredentials) => (getBedrockRuntimeProvider(bedrockCredentials) || bedrock)(modelId),
        embeddingModel: (modelId, _apiKey, bedrockCredentials) => (getBedrockRuntimeProvider(bedrockCredentials) || bedrock).embedding(modelId),
    },
    openai: {
        id: "openai",
        supportsEmbeddings: true,
        isConfigured: (apiKey) => Boolean(apiKey || process.env.OPENAI_API_KEY),
        languageModel: (modelId, apiKey) => (apiKey ? createOpenAI({ apiKey })(modelId) : openai(modelId)),
        embeddingModel: (modelId, apiKey) => (apiKey ? createOpenAI({ apiKey }).embedding(modelId) : openai.embedding(modelId)),
    },
    anthropic: {
        id: "anthropic",
        supportsEmbeddings: false,
        isConfigured: (apiKey) => Boolean(apiKey || process.env.ANTHROPIC_API_KEY),
        languageModel: (modelId, apiKey) => (apiKey ? createAnthropic({ apiKey })(modelId) : anthropic(modelId)),
    },
    google: {
        id: "google",
        supportsEmbeddings: true,
        isConfigured: (apiKey) => Boolean(apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
        languageModel: (modelId, apiKey) => (apiKey ? createGoogleGenerativeAI({ apiKey })(modelId) : google(modelId)),
        embeddingModel: (modelId, apiKey) => (apiKey ? createGoogleGenerativeAI({ apiKey }).textEmbeddingModel(modelId) : google.textEmbeddingModel(modelId)),
    },
};

export interface ProviderModelSelection {
    providerId?: LLMProviderId;
    modelId?: string;
    apiKey?: string;
    bedrockCredentials?: BedrockRuntimeCredentials;
}

export interface EmbeddingSelection {
    providerId?: LLMProviderId;
    modelId?: string;
    apiKey?: string;
    bedrockCredentials?: BedrockRuntimeCredentials;
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

    if (!adapter.isConfigured(selection?.apiKey, selection?.bedrockCredentials)) {
        const fallbackProviderId = getConfiguredProviders()[0] || DEFAULT_PROVIDER_ID;
        const fallbackModelId = getModelsByProvider(fallbackProviderId)[0]?.id || resolved.modelId;
        return {
            providerId: fallbackProviderId,
            modelId: fallbackModelId,
            apiKey: selection?.apiKey,
            bedrockCredentials: selection?.bedrockCredentials,
        };
    }

    return {
        ...resolved,
        apiKey: selection?.apiKey,
        bedrockCredentials: selection?.bedrockCredentials,
    };
}

export function resolveEmbeddingSelection(selection?: EmbeddingSelection) {
    const preferredProviderId = resolveProviderId(selection?.modelId, selection?.providerId);
    const preferredAdapter = getProviderAdapter(preferredProviderId);

    if (preferredAdapter.supportsEmbeddings && preferredAdapter.isConfigured(selection?.apiKey, selection?.bedrockCredentials)) {
        const embeddingModel = SUPPORTED_EMBEDDING_MODELS.find((model) => model.providerId === preferredProviderId);
        if (embeddingModel) {
            return {
                providerId: preferredProviderId,
                modelId: embeddingModel.id,
                apiKey: selection?.apiKey,
                bedrockCredentials: selection?.bedrockCredentials,
            };
        }
    }

    const configuredProviders = getConfiguredProvidersSet();
    const fallbackEmbeddingModel = SUPPORTED_EMBEDDING_MODELS.find((model) => configuredProviders.has(model.providerId))
        || SUPPORTED_EMBEDDING_MODELS[0];

    return {
        providerId: fallbackEmbeddingModel.providerId,
        modelId: fallbackEmbeddingModel.id,
        apiKey: selection?.apiKey,
        bedrockCredentials: selection?.bedrockCredentials,
    };
}
