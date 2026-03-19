export const SITE_NAME = "Promitly";
export const SITE_TAGLINE = "Local-first prompt QA platform for private prompt evaluation, prompt testing, and LLM regression checks";
export const SITE_DESCRIPTION =
    "Promitly is an open-source, local-first prompt evaluation platform that helps developers test prompts privately in their own environment without exposing prompt logic to a third-party hosted prompt testing platform. It supports prompt comparison, LLM regression checks, structured output validation, human review, and prompt quality analytics.";
export const SITE_KEYWORDS = [
    "prompt evaluation",
    "prompt testing",
    "local prompt testing",
    "private prompt evaluation",
    "local-first AI tooling",
    "offline prompt testing",
    "prompt engineering",
    "prompt QA",
    "LLM evaluation",
    "AI evaluation dashboard",
    "prompt regression testing",
    "prompt versioning",
    "LLM quality assurance",
    "structured output validation",
    "prompt comparison",
    "AI testing platform",
    "AWS Bedrock prompt evaluation",
    "open source prompt tool",
    "GitHub prompt evaluation project",
    "private prompt testing platform",
    "self-hosted prompt evaluation",
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
