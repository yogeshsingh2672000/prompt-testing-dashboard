import { OutputValidationConfig, OutputValidationResult } from "@/shared/types";

function createResult(
    type: OutputValidationResult["type"],
    enabled: boolean,
    passed: boolean,
    message: string
): OutputValidationResult {
    return {
        type,
        enabled,
        passed,
        message,
    };
}

export function validateStructuredOutput(
    response: string,
    config?: OutputValidationConfig
): OutputValidationResult {
    if (!config || config.type === "none") {
        return createResult("none", false, true, "No structured output validation configured.");
    }

    const normalizedResponse = response.trim();

    switch (config.type) {
        case "json": {
            if (!normalizedResponse) {
                return createResult("json", true, false, "Expected a valid JSON response, but the output was empty.");
            }

            try {
                JSON.parse(normalizedResponse);
                return createResult("json", true, true, "Returned valid JSON.");
            } catch {
                return createResult("json", true, false, "Expected valid JSON, but the model output could not be parsed.");
            }
        }
        case "contains": {
            const expectedSubstring = config.value?.trim();
            if (!expectedSubstring) {
                return createResult("contains", true, true, "No required substring provided.");
            }

            const passed = normalizedResponse.includes(expectedSubstring);
            return createResult(
                "contains",
                true,
                passed,
                passed
                    ? `Included required text: "${expectedSubstring}".`
                    : `Missing required text: "${expectedSubstring}".`
            );
        }
        case "starts_with": {
            const expectedPrefix = config.value?.trim();
            if (!expectedPrefix) {
                return createResult("starts_with", true, true, "No required prefix provided.");
            }

            const passed = normalizedResponse.startsWith(expectedPrefix);
            return createResult(
                "starts_with",
                true,
                passed,
                passed
                    ? `Started with required prefix: "${expectedPrefix}".`
                    : `Expected output to start with "${expectedPrefix}".`
            );
        }
        case "regex": {
            const pattern = config.value?.trim();
            if (!pattern) {
                return createResult("regex", true, true, "No regex pattern provided.");
            }

            try {
                const regex = new RegExp(pattern);
                const passed = regex.test(normalizedResponse);
                return createResult(
                    "regex",
                    true,
                    passed,
                    passed
                        ? `Matched regex pattern: ${pattern}.`
                        : `Did not match regex pattern: ${pattern}.`
                );
            } catch {
                return createResult("regex", true, false, "The configured regex pattern is invalid.");
            }
        }
        default:
            return createResult("none", false, true, "No structured output validation configured.");
    }
}
