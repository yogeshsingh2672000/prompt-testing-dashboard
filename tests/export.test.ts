import { describe, expect, it, vi } from "vitest";
import { parseImportedSuites, suiteToCsv, suitesToJson } from "@/shared/lib/export";
import type { TestCaseSuite } from "@/shared/lib/persistence";

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
});
