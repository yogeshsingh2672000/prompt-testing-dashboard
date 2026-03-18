import { DEFAULT_RUBRICS } from "@/shared/constants/defaults";
import { PromptVersion, TestCaseSuite } from "@/shared/lib/persistence";
import { EvaluationResult, OutputValidationType, TestCase } from "@/shared/types";

/**
 * Converts evaluation results to a CSV string
 */
export function resultsToCSV(results: EvaluationResult[], testCases: TestCase[]): string {
    const headers = [
        "Test Case ID",
        "Input",
        "Expected Output",
        "LLM Response",
        "Status",
        "Similarity (%)",
        "Semantic Score (%)",
        "Latency (ms)",
        "Prompt Tokens",
        "Completion Tokens",
        "Total Tokens",
        "Cost (USD)"
    ];

    const rows = results.map(result => {
        const testCase = testCases.find(tc => tc.id === result.testCaseId);
        return [
            result.testCaseId,
            `"${(testCase?.input || "").replace(/"/g, '""')}"`,
            `"${(testCase?.expectedOutput || "").replace(/"/g, '""')}"`,
            `"${(result.response || "").replace(/"/g, '""')}"`,
            result.status,
            result.similarity.toFixed(2),
            result.semanticScore.toFixed(0),
            result.metrics?.latencyMs || 0,
            result.metrics?.tokens.prompt || 0,
            result.metrics?.tokens.completion || 0,
            result.metrics?.tokens.total || 0,
            result.metrics?.costUsd.toFixed(6) || 0
        ];
    });

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

/**
 * Triggers a browser download of a file
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];

        if (character === '"') {
            const nextCharacter = line[index + 1];
            if (inQuotes && nextCharacter === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (character === "," && !inQuotes) {
            values.push(current);
            current = "";
            continue;
        }

        current += character;
    }

    values.push(current);
    return values;
}

export function suitesToJson(suites: TestCaseSuite[]): string {
    return JSON.stringify(
        {
            version: 1,
            exportedAt: new Date().toISOString(),
            suites,
        },
        null,
        2
    );
}

export function suiteToCsv(suite: TestCaseSuite): string {
    const headers = [
        "Suite Name",
        "System Prompt",
        "User Input",
        "Test Case ID",
        "Input",
        "Expected Output",
        "Validation Type",
        "Validation Value",
    ];

    const rows = suite.testCases.map((testCase) => [
        escapeCsv(suite.name),
        escapeCsv(suite.systemPrompt),
        escapeCsv(suite.userInput),
        escapeCsv(testCase.id),
        escapeCsv(testCase.input),
        escapeCsv(testCase.expectedOutput),
        escapeCsv(testCase.outputValidation?.type || "none"),
        escapeCsv(testCase.outputValidation?.value || ""),
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function normalizeImportedSuite(partialSuite: Partial<TestCaseSuite>, fallbackName: string): TestCaseSuite {
    const now = Date.now();

    return {
        id: crypto.randomUUID(),
        name: partialSuite.name?.trim() || fallbackName,
        systemPrompt: partialSuite.systemPrompt || "",
        userInput: partialSuite.userInput || "",
        testCases: (partialSuite.testCases || []).map((testCase) => ({
            id: testCase.id || crypto.randomUUID(),
            input: testCase.input || "",
            expectedOutput: testCase.expectedOutput || "",
            variables: testCase.variables,
            outputValidation: testCase.outputValidation?.type
                ? {
                    type: testCase.outputValidation.type,
                    value: testCase.outputValidation.value || "",
                }
                : { type: "none" },
        })),
        rubrics: partialSuite.rubrics?.length ? partialSuite.rubrics : DEFAULT_RUBRICS,
        versionCount: partialSuite.versionCount,
        createdAt: now,
        updatedAt: now,
    };
}

export async function parseImportedSuites(file: File): Promise<TestCaseSuite[]> {
    const content = await file.text();
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith(".json")) {
        const parsed = JSON.parse(content) as unknown;
        const suites = Array.isArray(parsed)
            ? parsed
            : typeof parsed === "object" && parsed !== null && "suites" in parsed && Array.isArray(parsed.suites)
                ? parsed.suites
                : [parsed];

        return suites
            .filter((suite): suite is Partial<TestCaseSuite> => typeof suite === "object" && suite !== null && Array.isArray(suite.testCases) && suite.testCases.length > 0)
            .map((suite, index) => normalizeImportedSuite(suite, `Imported Suite ${index + 1}`));
    }

    if (lowerName.endsWith(".csv")) {
        const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
            throw new Error("CSV file must include a header row and at least one test case.");
        }

        const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
        const columnIndex = (name: string) => headers.indexOf(name);
        const inputIndex = columnIndex("input");
        const expectedOutputIndex = columnIndex("expected output");

        if (inputIndex === -1 || expectedOutputIndex === -1) {
            throw new Error('CSV import requires "Input" and "Expected Output" columns.');
        }

        const suiteNameIndex = columnIndex("suite name");
        const systemPromptIndex = columnIndex("system prompt");
        const userInputIndex = columnIndex("user input");
        const validationTypeIndex = columnIndex("validation type");
        const validationValueIndex = columnIndex("validation value");

        const rows = lines.slice(1).map(parseCsvLine);
        const suiteName = suiteNameIndex >= 0 ? rows[0]?.[suiteNameIndex] || file.name.replace(/\.csv$/i, "") : file.name.replace(/\.csv$/i, "");
        const systemPrompt = systemPromptIndex >= 0 ? rows[0]?.[systemPromptIndex] || "" : "";
        const userInput = userInputIndex >= 0 ? rows[0]?.[userInputIndex] || "" : "";

        return [
            normalizeImportedSuite(
                {
                    name: suiteName,
                    systemPrompt,
                    userInput,
                    testCases: rows.map((row) => ({
                        id: crypto.randomUUID(),
                        input: row[inputIndex] || "",
                        expectedOutput: row[expectedOutputIndex] || "",
                        outputValidation: validationTypeIndex >= 0
                            ? {
                                type: (row[validationTypeIndex] || "none") as OutputValidationType,
                                value: validationValueIndex >= 0 ? row[validationValueIndex] || "" : "",
                            }
                            : { type: "none" },
                    })),
                },
                suiteName || "Imported CSV Suite"
            ),
        ];
    }

    throw new Error("Unsupported file type. Use JSON or CSV.");
}

export function promptVersionsToJson(versions: PromptVersion[]): string {
    return JSON.stringify(
        {
            version: 1,
            exportedAt: new Date().toISOString(),
            promptVersions: versions,
        },
        null,
        2
    );
}
