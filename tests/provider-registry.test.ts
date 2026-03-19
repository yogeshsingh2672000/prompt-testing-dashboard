import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PROVIDER_ID, getModelDisplayName, resolveProviderModelSelection } from "@/shared/constants/models";
import {
    getConfiguredProviders,
    resolveEmbeddingSelection,
    resolveLanguageSelection,
} from "@/server/lib/provider-registry";

describe("provider registry", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("keeps provider/model resolution explicit", () => {
        expect(resolveProviderModelSelection("gpt-4o-mini")).toEqual({
            providerId: "openai",
            modelId: "gpt-4o-mini",
        });
        expect(resolveProviderModelSelection(undefined, "google")).toEqual({
            providerId: "google",
            modelId: "gemini-2.5-flash",
        });
    });

    it("falls back to the first configured provider when the selected provider is unavailable", () => {
        vi.stubEnv("OPENAI_API_KEY", "test-openai-key");

        expect(resolveLanguageSelection({
            providerId: "bedrock",
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        })).toEqual({
            providerId: "openai",
            modelId: "gpt-4.1-mini",
        });
    });

    it("uses the selected provider for embeddings when that provider supports them", () => {
        vi.stubEnv("OPENAI_API_KEY", "test-openai-key");

        expect(resolveEmbeddingSelection({
            providerId: "openai",
            modelId: "gpt-4.1-mini",
        })).toEqual({
            providerId: "openai",
            modelId: "text-embedding-3-small",
        });
    });

    it("falls back to another configured embedding provider when the selected one lacks embeddings", () => {
        vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
        vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");

        expect(resolveEmbeddingSelection({
            providerId: "anthropic",
            modelId: "claude-3-5-sonnet-20241022",
        })).toEqual({
            providerId: "google",
            modelId: "gemini-embedding-001",
        });
    });

    it("reports configured providers and readable model labels", () => {
        vi.stubEnv("AWS_REGION", "us-east-1");
        vi.stubEnv("OPENAI_API_KEY", "test-openai-key");

        expect(getConfiguredProviders()).toEqual(["bedrock", "openai"]);
        expect(getModelDisplayName("gpt-4.1")).toBe("GPT-4.1 (OpenAI)");
        expect(resolveProviderModelSelection(undefined, undefined).providerId).toBe(DEFAULT_PROVIDER_ID);
    });
});
