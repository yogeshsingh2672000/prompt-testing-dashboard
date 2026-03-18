import { describe, expect, it, vi } from "vitest";
import { parseImportedSuites, promptVersionsToJson, resultsToCSV, suiteToCsv, suitesToJson } from "@/shared/lib/export";
import type { TestCaseSuite } from "@/shared/lib/persistence";
import type { EvaluationResult } from "@/shared/types";

describe("dataset import/export", () => {
    it("exports suites to json", () => {
        const suites: TestCaseSuite[] = [
            {
                id: "suite-1",
                name: "Support Suite",
                systemPrompt: "You are helpful",
                userInput: "{{input}}",
                testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi", outputValidation: { type: "none" } }],
                rubrics: [],
                createdAt: 1,
                updatedAt: 1,
            },
        ];

        const json = suitesToJson(suites);
        expect(json).toContain('"name": "Support Suite"');
        expect(json).toContain('"version": 1');
    });

    it("exports a suite to csv", () => {
        const suite: TestCaseSuite = {
            id: "suite-1",
            name: "CSV Suite",
            systemPrompt: "Prompt",
            userInput: "{{input}}",
            testCases: [{ id: "tc-1", input: "hello", expectedOutput: "hi", outputValidation: { type: "contains", value: "hi" } }],
            rubrics: [],
            createdAt: 1,
            updatedAt: 1,
        };

        const csv = suiteToCsv(suite);
        expect(csv).toContain("Suite Name");
        expect(csv).toContain('"CSV Suite"');
        expect(csv).toContain('"contains"');
    });

    it("exports results to csv and prompt versions to json", () => {
        const results: EvaluationResult[] = [
            {
                testCaseId: "tc-1",
                response: 'hello "world"',
                similarity: 91.24,
                semanticScore: 88,
                rubricScore: 80,
                overallScore: 84,
                status: "pass",
                metrics: {
                    latencyMs: 120,
                    tokens: { prompt: 10, completion: 6, total: 16 },
                    costUsd: 0.001234,
                },
                validation: { type: "none", enabled: false, passed: true, message: "" },
                rubricResults: [],
            },
        ];

        const csv = resultsToCSV(results, [
            { id: "tc-1", input: 'say "hello"', expectedOutput: "hi", outputValidation: { type: "none" } },
        ]);
        const json = promptVersionsToJson([
            {
                id: "pv-1",
                name: "Prompt v1",
                prompt: "You are helpful",
                createdAt: 1,
            },
        ]);

        expect(csv).toContain('"say ""hello"""');
        expect(csv).toContain('"hello ""world"""');
        expect(csv).toContain("0.001234");
        expect(json).toContain('"promptVersions"');
        expect(json).toContain('"Prompt v1"');
    });

    it("imports suites from json and csv files", async () => {
        vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("generated-id");

        const jsonFile = new File(
            [
                JSON.stringify({
                    suites: [
                        {
                            name: "Imported JSON",
                            systemPrompt: "System",
                            userInput: "{{input}}",
                            testCases: [{ id: "tc-json", input: "hello", expectedOutput: "hi" }],
                            rubrics: [],
                        },
                    ],
                }),
            ],
            "suite.json",
            { type: "application/json" }
        );

        const csvFile = new File(
            [
                [
                    "Suite Name,System Prompt,User Input,Test Case ID,Input,Expected Output,Validation Type,Validation Value",
                    '"Imported CSV","System","{{input}}","tc-csv","hello","hi","contains","hi"',
                ].join("\n"),
            ],
            "suite.csv",
            { type: "text/csv" }
        );

        const [jsonSuites, csvSuites] = await Promise.all([
            parseImportedSuites(jsonFile),
            parseImportedSuites(csvFile),
        ]);

        expect(jsonSuites).toHaveLength(1);
        expect(jsonSuites[0].name).toBe("Imported JSON");
        expect(csvSuites).toHaveLength(1);
        expect(csvSuites[0].testCases[0].outputValidation?.type).toBe("contains");
    });

    it("normalizes imported suites and applies defaults", async () => {
        vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("generated-id");

        const jsonFile = new File(
            [
                JSON.stringify({
                    name: "   ",
                    systemPrompt: "Prompt",
                    userInput: "{{input}}",
                    testCases: [
                        {
                            input: "hello",
                            expectedOutput: "hi",
                        },
                    ],
                }),
            ],
            "single-suite.json",
            { type: "application/json" }
        );

        const [suite] = await parseImportedSuites(jsonFile);

        expect(suite.name).toBe("Imported Suite 1");
        expect(suite.testCases[0].id).toBe("generated-id");
        expect(suite.testCases[0].outputValidation).toEqual({ type: "none" });
        expect(suite.rubrics.length).toBeGreaterThan(0);
    });

    it("rejects malformed imports and unsupported file types", async () => {
        const invalidCsv = new File(["Input\nhello"], "invalid.csv", { type: "text/csv" });
        const headerOnlyCsv = new File(["Input,Expected Output"], "empty.csv", { type: "text/csv" });
        const unsupportedFile = new File(["hello"], "suite.txt", { type: "text/plain" });

        await expect(parseImportedSuites(invalidCsv)).rejects.toThrow('CSV import requires "Input" and "Expected Output" columns.');
        await expect(parseImportedSuites(headerOnlyCsv)).rejects.toThrow("CSV file must include a header row and at least one test case.");
        await expect(parseImportedSuites(unsupportedFile)).rejects.toThrow("Unsupported file type. Use JSON or CSV.");
    });
});
