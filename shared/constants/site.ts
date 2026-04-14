export const SITE_NAME = "Promitly";
export const SITE_TAGLINE = "Test prompts like code, without handing them to someone else's platform";
export const SITE_DESCRIPTION =
    "Promitly is an open-source, local-first prompt QA platform that helps developers test prompts privately in their own environment without exposing prompt logic to a hosted evaluator. It supports prompt comparison, regression checks, structured output validation, human review, analytics, reports, and multi-provider model evaluation.";
export const SITE_KEYWORDS = [
    "prompt evaluation",
    "prompt testing",
    "local prompt testing",
    "private prompt evaluation",
    "local-first AI tooling",
    "private prompt testing",
    "prompt engineering",
    "prompt QA",
    "LLM evaluation",
    "AI QA platform",
    "prompt regression testing",
    "prompt versioning",
    "LLM quality assurance",
    "structured output validation",
    "prompt comparison",
    "multi-provider LLM evaluation",
    "AWS Bedrock prompt evaluation",
    "OpenAI prompt evaluation",
    "Anthropic prompt testing",
    "Gemini prompt testing",
    "self-hosted prompt evaluation",
    "open source prompt tool",
];

export const SITE_DEFAULT_LOCALE = "en";
export const SITE_LOCALES = ["en", "hi"] as const;

export function getSiteUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, "");
    }

    return "http://localhost:3000";
}

export const SOCIAL_IMAGE_PATH = "/og/promitly-social.svg";
