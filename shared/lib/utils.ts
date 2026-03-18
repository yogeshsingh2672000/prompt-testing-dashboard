import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function cosineSimilarity(vecA: number[], vecB: number[]) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    const denominator = magnitudeA * magnitudeB;
    return denominator === 0 ? 0 : dotProduct / denominator;
}

export function chunk<T>(array: T[], size: number): T[][] {
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

export function formatCost(cost: number): string {
    if (cost === 0) return '$0.00';
    if (cost >= 0.01) return `$${cost.toFixed(2)}`;
    if (cost >= 0.0001) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(6)}`;
}

export function templateReplace(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const trimmedKey = key.trim();
        return vars[trimmedKey] !== undefined ? vars[trimmedKey] : `{{${trimmedKey}}}`;
    });
}

export function extractVariables(text: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.add(match[1].trim());
    }
    return Array.from(matches);
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function extractJson<T>(text: string): T {
    const trimmed = text.trim();
    const cleaned = trimmed.replace(/```json\s*/i, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(cleaned) as T;
    } catch {
        const start = cleaned.search(/[\[{]/);
        const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));

        if (start === -1 || end === -1 || end < start) {
            throw new Error('Model did not return valid JSON');
        }

        return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
}
