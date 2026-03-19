import {
    ConversationTurn,
    EvaluationRequest,
    EvaluationResult,
    LLMProviderId,
    OptimizePromptRequest,
    OutputValidationConfig,
    OutputValidationType,
    RubricDefinition,
    TestCase,
} from "@/shared/types";

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseProviderId(value: unknown): LLMProviderId | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    if (["bedrock", "openai", "anthropic", "google"].includes(value)) {
        return value as LLMProviderId;
    }

    return undefined;
}

function parseOutputValidation(value: unknown): OutputValidationConfig | undefined {
    if (!isObject(value) || typeof value.type !== "string") {
        return undefined;
    }

    const allowedTypes: OutputValidationType[] = ["none", "json", "contains", "starts_with", "regex"];
    if (!allowedTypes.includes(value.type as OutputValidationType)) {
        return undefined;
    }

    return {
        type: value.type as OutputValidationType,
        value: typeof value.value === "string" ? value.value : undefined,
    };
}

function parseConversationTurn(value: unknown, index: number): ConversationTurn {
    if (!isObject(value) || typeof value.id !== "string" || typeof value.content !== "string" || typeof value.role !== "string") {
        throw new Error(`Conversation turn ${index + 1} is invalid`);
    }

    if (!["user", "assistant", "tool"].includes(value.role)) {
        throw new Error(`Conversation turn ${index + 1} is invalid`);
    }

    return {
        id: value.id,
        content: value.content,
        role: value.role as ConversationTurn["role"],
    };
}

function parseTestCase(value: unknown, index: number): TestCase {
    if (!isObject(value)) {
        throw new Error(`Test case ${index + 1} must be an object`);
    }

    if (typeof value.id !== "string" || typeof value.input !== "string" || typeof value.expectedOutput !== "string") {
        throw new Error(`Test case ${index + 1} is missing required string fields`);
    }

    const variables = isObject(value.variables)
        ? Object.fromEntries(Object.entries(value.variables).filter((entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string"))
        : undefined;

    return {
        id: value.id,
        input: value.input,
        expectedOutput: value.expectedOutput,
        variables,
        outputValidation: parseOutputValidation(value.outputValidation),
        conversation: Array.isArray(value.conversation) ? value.conversation.map(parseConversationTurn) : undefined,
    };
}

function parseRubric(value: unknown, index: number): RubricDefinition {
    if (!isObject(value)) {
        throw new Error(`Rubric ${index + 1} must be an object`);
    }

    if (
        typeof value.id !== "string" ||
        typeof value.name !== "string" ||
        typeof value.description !== "string" ||
        typeof value.weight !== "number" ||
        typeof value.enabled !== "boolean"
    ) {
        throw new Error(`Rubric ${index + 1} is invalid`);
    }

    return {
        id: value.id,
        name: value.name,
        description: value.description,
        weight: value.weight,
        enabled: value.enabled,
    };
}

function parseEvaluationResult(value: unknown, index: number): EvaluationResult {
    if (!isObject(value) || typeof value.testCaseId !== "string" || typeof value.response !== "string") {
        throw new Error(`Evaluation result ${index + 1} is invalid`);
    }

    return {
        testCaseId: value.testCaseId,
        response: value.response,
        similarity: typeof value.similarity === "number" ? value.similarity : 0,
        semanticScore: typeof value.semanticScore === "number" ? value.semanticScore : 0,
        rubricScore: typeof value.rubricScore === "number" ? value.rubricScore : 0,
        overallScore: typeof value.overallScore === "number" ? value.overallScore : 0,
        status: value.status === "pass" ? "pass" : "fail",
        metrics: isObject(value.metrics)
            ? {
                latencyMs: typeof value.metrics.latencyMs === "number" ? value.metrics.latencyMs : 0,
                tokens: isObject(value.metrics.tokens)
                    ? {
                        prompt: typeof value.metrics.tokens.prompt === "number" ? value.metrics.tokens.prompt : 0,
                        completion: typeof value.metrics.tokens.completion === "number" ? value.metrics.tokens.completion : 0,
                        total: typeof value.metrics.tokens.total === "number" ? value.metrics.tokens.total : 0,
                    }
                    : { prompt: 0, completion: 0, total: 0 },
                costUsd: typeof value.metrics.costUsd === "number" ? value.metrics.costUsd : 0,
            }
            : {
                latencyMs: 0,
                tokens: { prompt: 0, completion: 0, total: 0 },
                costUsd: 0,
            },
        validation: isObject(value.validation) && typeof value.validation.type === "string"
            ? {
                type: value.validation.type as OutputValidationType,
                enabled: typeof value.validation.enabled === "boolean" ? value.validation.enabled : false,
                passed: typeof value.validation.passed === "boolean" ? value.validation.passed : true,
                message: typeof value.validation.message === "string" ? value.validation.message : "",
            }
            : {
                type: "none",
                enabled: false,
                passed: true,
                message: "",
            },
        rubricResults: Array.isArray(value.rubricResults) ? value.rubricResults as EvaluationResult["rubricResults"] : [],
        error: typeof value.error === "string" ? value.error : undefined,
    };
}

export function parseEvaluationRequest(payload: unknown): EvaluationRequest {
    if (!isObject(payload)) {
        throw new Error("Evaluation request payload must be an object");
    }

    if (typeof payload.systemPrompt !== "string" || typeof payload.userInput !== "string" || !Array.isArray(payload.testCases)) {
        throw new Error("Evaluation request is missing required fields");
    }

    return {
        systemPrompt: payload.systemPrompt,
        userInput: payload.userInput,
        testCases: payload.testCases.map(parseTestCase),
        batchSize: typeof payload.batchSize === "number" ? payload.batchSize : Number(payload.batchSize) || 1,
        threshold: typeof payload.threshold === "number" ? payload.threshold : Number(payload.threshold) || 0,
        providerId: parseProviderId(payload.providerId),
        modelId: typeof payload.modelId === "string" ? payload.modelId : undefined,
        rubrics: Array.isArray(payload.rubrics) ? payload.rubrics.map(parseRubric) : undefined,
    };
}

export function parseGenerateTestCasesRequest(payload: unknown): {
    systemPrompt: string;
    sampleInput: string;
    count: number;
    providerId?: LLMProviderId;
    modelId?: string;
} {
    if (!isObject(payload)) {
        throw new Error("Test case generation payload must be an object");
    }

    if (typeof payload.systemPrompt !== "string") {
        throw new Error("System prompt is required");
    }

    return {
        systemPrompt: payload.systemPrompt,
        sampleInput: typeof payload.sampleInput === "string" ? payload.sampleInput : "",
        count: typeof payload.count === "number" ? payload.count : Number(payload.count) || 5,
        providerId: parseProviderId(payload.providerId),
        modelId: typeof payload.modelId === "string" ? payload.modelId : undefined,
    };
}

export function parseOptimizePromptRequest(payload: unknown): OptimizePromptRequest {
    if (!isObject(payload)) {
        throw new Error("Optimize prompt payload must be an object");
    }

    if (typeof payload.currentPrompt !== "string" || !Array.isArray(payload.results)) {
        throw new Error("Optimize prompt request is missing required fields");
    }

    return {
        currentPrompt: payload.currentPrompt,
        results: payload.results.map(parseEvaluationResult),
        providerId: parseProviderId(payload.providerId),
        modelId: typeof payload.modelId === "string" ? payload.modelId : undefined,
    };
}
