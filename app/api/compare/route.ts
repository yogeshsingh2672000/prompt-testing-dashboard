import { NextResponse } from "next/server";
import { getEvaluationErrorStatus } from "@/server/services/api-errors";
import { compareEvaluationRequests } from "@/server/services/compare-service";
import { parseEvaluationRequest } from "@/server/services/request-validation";

export async function POST(req: Request) {
    try {
        const payload = await req.json() as { left?: unknown; right?: unknown };
        const left = parseEvaluationRequest(payload.left);
        const right = parseEvaluationRequest(payload.right);
        const comparison = await compareEvaluationRequests({ left, right });

        return NextResponse.json(comparison);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Comparison failed";
        const status = getEvaluationErrorStatus(message);

        return NextResponse.json({ error: message }, { status });
    }
}
