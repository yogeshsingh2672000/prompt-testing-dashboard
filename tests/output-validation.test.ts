import { describe, expect, it } from "vitest";
import { validateStructuredOutput } from "@/server/services/output-validation";

describe("validateStructuredOutput", () => {
    it("passes when no validation is configured", () => {
        const result = validateStructuredOutput("hello world");

        expect(result.enabled).toBe(false);
        expect(result.passed).toBe(true);
        expect(result.type).toBe("none");
    });

    it("validates json output", () => {
        const passResult = validateStructuredOutput('{"ok":true}', { type: "json" });
        const failResult = validateStructuredOutput("{oops", { type: "json" });

        expect(passResult.passed).toBe(true);
        expect(failResult.passed).toBe(false);
    });

    it("validates contains, starts_with, and regex rules", () => {
        expect(validateStructuredOutput("alpha beta", { type: "contains", value: "beta" }).passed).toBe(true);
        expect(validateStructuredOutput("alpha beta", { type: "starts_with", value: "alpha" }).passed).toBe(true);
        expect(validateStructuredOutput("Case-42", { type: "regex", value: "^Case-\\d+$" }).passed).toBe(true);
        expect(validateStructuredOutput("Case-xx", { type: "regex", value: "^Case-\\d+$" }).passed).toBe(false);
    });
});
