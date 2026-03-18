import { describe, expect, it } from "vitest";
import {
    chunk,
    clamp,
    cn,
    cosineSimilarity,
    extractJson,
    extractVariables,
    formatCost,
    templateReplace,
} from "@/shared/lib/utils";

describe("shared utils", () => {
    it("merges class names with tailwind precedence", () => {
        expect(cn("px-2", "text-sm", "px-4")).toBe("text-sm px-4");
    });

    it("calculates cosine similarity and handles zero vectors", () => {
        expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
        expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
    });

    it("chunks arrays by size", () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("formats costs across precision thresholds", () => {
        expect(formatCost(0)).toBe("$0.00");
        expect(formatCost(0.02)).toBe("$0.02");
        expect(formatCost(0.0012)).toBe("$0.0012");
        expect(formatCost(0.000012)).toBe("$0.000012");
    });

    it("replaces template variables and preserves missing placeholders", () => {
        expect(
            templateReplace("Hello {{ name }}, welcome to {{company}} and {{missing}}", {
                name: "Yoges",
                company: "Promitly",
            })
        ).toBe("Hello Yoges, welcome to Promitly and {{missing}}");
    });

    it("extracts unique template variables", () => {
        expect(extractVariables("{{ name }} {{company}} {{ name }}")).toEqual(["name", "company"]);
    });

    it("clamps numeric values inside a range", () => {
        expect(clamp(10, 0, 5)).toBe(5);
        expect(clamp(-1, 0, 5)).toBe(0);
        expect(clamp(3, 0, 5)).toBe(3);
    });

    it("extracts JSON from fenced and wrapped model responses", () => {
        expect(extractJson<{ ok: boolean }>("```json\n{\"ok\":true}\n```")).toEqual({ ok: true });
        expect(extractJson<{ ok: boolean }>("Result:\n{\"ok\":true}\nThanks")).toEqual({ ok: true });
    });

    it("throws when no JSON can be found", () => {
        expect(() => extractJson("not json")).toThrow("Model did not return valid JSON");
    });
});
