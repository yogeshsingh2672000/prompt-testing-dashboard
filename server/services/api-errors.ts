export function getEvaluationErrorStatus(message: string) {
    return message === "System prompt is required" ||
        message === "At least one test case is required" ||
        message === "No valid test cases were provided"
        ? 400
        : 500;
}

export function getGenerateTestCasesErrorStatus(message: string) {
    if (message === "System prompt is required") {
        return 400;
    }

    if (message === "No valid test cases were generated") {
        return 502;
    }

    return 500;
}

export function getOptimizePromptErrorStatus(message: string) {
    return message === "Current prompt is required" || message === "Evaluation results are required"
        ? 400
        : 500;
}
