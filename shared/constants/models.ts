import { LLMProviderId, LLMProviderOption } from "@/shared/types";

export interface ModelPricing {
    inputPer1M: number;
    outputPer1M: number;
}

export interface SupportedModel {
    id: string;
    name: string;
    providerId: LLMProviderId;
    provider: string;
    pricing: ModelPricing;
}

export interface SupportedEmbeddingModel {
    id: string;
    name: string;
    providerId: LLMProviderId;
}

export const SUPPORTED_PROVIDERS: LLMProviderOption[] = [
    {
        id: "bedrock",
        name: "AWS Bedrock",
        description: "Use models routed through your AWS account.",
    },
    {
        id: "openai",
        name: "OpenAI",
        description: "Use OpenAI-hosted GPT models with your own API key.",
    },
    {
        id: "anthropic",
        name: "Anthropic",
        description: "Use Anthropic-hosted Claude models directly.",
    },
    {
        id: "google",
        name: "Google",
        description: "Use Gemini models with Google AI Studio credentials.",
    },
];

export const SUPPORTED_MODELS: SupportedModel[] = [
    {
        id: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        name: "Claude 3.5 Sonnet",
        providerId: "bedrock",
        provider: "AWS Bedrock",
        pricing: { inputPer1M: 3, outputPer1M: 15 },
    },
    {
        id: "anthropic.claude-3-sonnet-20240229-v1:0",
        name: "Claude 3 Sonnet",
        providerId: "bedrock",
        provider: "AWS Bedrock",
        pricing: { inputPer1M: 3, outputPer1M: 15 },
    },
    {
        id: "anthropic.claude-3-haiku-20240307-v1:0",
        name: "Claude 3 Haiku",
        providerId: "bedrock",
        provider: "AWS Bedrock",
        pricing: { inputPer1M: 0.25, outputPer1M: 1.25 },
    },
    {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 Mini",
        providerId: "openai",
        provider: "OpenAI",
        pricing: { inputPer1M: 0.4, outputPer1M: 1.6 },
    },
    {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        providerId: "openai",
        provider: "OpenAI",
        pricing: { inputPer1M: 0.15, outputPer1M: 0.6 },
    },
    {
        id: "gpt-4.1",
        name: "GPT-4.1",
        providerId: "openai",
        provider: "OpenAI",
        pricing: { inputPer1M: 2, outputPer1M: 8 },
    },
    {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        providerId: "anthropic",
        provider: "Anthropic",
        pricing: { inputPer1M: 3, outputPer1M: 15 },
    },
    {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        providerId: "anthropic",
        provider: "Anthropic",
        pricing: { inputPer1M: 1, outputPer1M: 5 },
    },
    {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        providerId: "anthropic",
        provider: "Anthropic",
        pricing: { inputPer1M: 0.25, outputPer1M: 1.25 },
    },
    {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        providerId: "google",
        provider: "Google",
        pricing: { inputPer1M: 0.3, outputPer1M: 2.5 },
    },
    {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        providerId: "google",
        provider: "Google",
        pricing: { inputPer1M: 1.25, outputPer1M: 10 },
    },
];

export const SUPPORTED_EMBEDDING_MODELS: SupportedEmbeddingModel[] = [
    {
        id: "amazon.titan-embed-text-v2:0",
        name: "Titan Embed Text V2",
        providerId: "bedrock",
    },
    {
        id: "text-embedding-3-small",
        name: "Text Embedding 3 Small",
        providerId: "openai",
    },
    {
        id: "gemini-embedding-001",
        name: "Gemini Embedding 001",
        providerId: "google",
    },
];

export const DEFAULT_PROVIDER_ID: LLMProviderId = "bedrock";
export const DEFAULT_MODEL_ID =
    SUPPORTED_MODELS.find((model) => model.providerId === DEFAULT_PROVIDER_ID)?.id ?? SUPPORTED_MODELS[0].id;

export function getProviderDefinition(providerId: LLMProviderId) {
    return SUPPORTED_PROVIDERS.find((provider) => provider.id === providerId);
}

export function getModelsByProvider(providerId: LLMProviderId) {
    return SUPPORTED_MODELS.filter((model) => model.providerId === providerId);
}

export function getModelDefinition(modelId?: string) {
    if (!modelId) {
        return undefined;
    }

    return SUPPORTED_MODELS.find((model) => model.id === modelId);
}

export function resolveProviderId(modelId?: string, providerId?: LLMProviderId): LLMProviderId {
    return providerId || getModelDefinition(modelId)?.providerId || DEFAULT_PROVIDER_ID;
}

export function resolveModelId(modelId?: string, providerId?: LLMProviderId) {
    if (modelId && getModelDefinition(modelId)) {
        return modelId;
    }

    const resolvedProviderId = resolveProviderId(modelId, providerId);
    return getModelsByProvider(resolvedProviderId)[0]?.id || DEFAULT_MODEL_ID;
}

export function resolveProviderModelSelection(modelId?: string, providerId?: LLMProviderId) {
    const resolvedProviderId = resolveProviderId(modelId, providerId);
    const resolvedModelId = resolveModelId(modelId, resolvedProviderId);

    return {
        providerId: resolvedProviderId,
        modelId: resolvedModelId,
    };
}

export function getModelDisplayName(modelId?: string) {
    const model = getModelDefinition(modelId);
    return model ? `${model.name} (${model.provider})` : modelId || "Unknown model";
}
