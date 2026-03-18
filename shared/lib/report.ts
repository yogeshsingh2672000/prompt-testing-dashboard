import { TestRun } from "@/shared/lib/persistence";
import { CaseReview, EvaluationResult, TestCase } from "@/shared/types";

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getTestCase(run: TestRun, testCaseId: string): TestCase | undefined {
    return run.testCases.find((testCase) => testCase.id === testCaseId);
}

function getReview(run: TestRun, testCaseId: string): CaseReview | undefined {
    return run.reviews?.[testCaseId];
}

function getFinalStatus(result: EvaluationResult, review?: CaseReview) {
    return review?.overrideStatus || result.status;
}

function getReviewedCounts(run: TestRun) {
    return run.results.reduce(
        (summary, result) => {
            const review = getReview(run, result.testCaseId);
            const decision = review?.decision || "pending";
            summary[decision] += 1;
            return summary;
        },
        { pending: 0, approved: 0, rejected: 0 }
    );
}

function getTopFailures(run: TestRun) {
    return run.results
        .filter((result) => getFinalStatus(result, getReview(run, result.testCaseId)) === "fail")
        .sort((left, right) => left.overallScore - right.overallScore)
        .slice(0, 5);
}

export function buildRunReportMarkdown(run: TestRun): string {
    const reviewCounts = getReviewedCounts(run);
    const topFailures = getTopFailures(run);

    const sections = [
        `# ${run.name}`,
        ``,
        `Generated: ${new Date().toLocaleString()}`,
        `Run timestamp: ${new Date(run.timestamp).toLocaleString()}`,
        ``,
        `## Summary`,
        `- Total cases: ${run.metrics.totalCases}`,
        `- Automated pass rate: ${run.metrics.passRate.toFixed(0)}%`,
        `- Average overall score: ${run.metrics.avgOverall.toFixed(1)}%`,
        `- Average semantic score: ${run.metrics.avgSemantic.toFixed(1)}%`,
        `- Average rubric score: ${run.metrics.avgRubric.toFixed(1)}%`,
        `- Average similarity: ${run.metrics.avgSimilarity.toFixed(1)}%`,
        ``,
        `## Review Status`,
        `- Pending: ${reviewCounts.pending}`,
        `- Approved: ${reviewCounts.approved}`,
        `- Rejected: ${reviewCounts.rejected}`,
        ``,
        `## Prompt`,
        `### System Prompt`,
        "```",
        run.systemPrompt || "(empty)",
        "```",
        `### User Input Template`,
        "```",
        run.userInput || "(empty)",
        "```",
        ``,
        `## Top Failures`,
        ...(topFailures.length === 0
            ? ["- No failing cases in this run."]
            : topFailures.flatMap((result, index) => {
                const testCase = getTestCase(run, result.testCaseId);
                const review = getReview(run, result.testCaseId);
                return [
                    `### ${index + 1}. ${testCase?.input || `Case ${index + 1}`}`,
                    `- Final status: ${getFinalStatus(result, review)}`,
                    `- Automated status: ${result.status}`,
                    `- Overall: ${result.overallScore.toFixed(1)}%`,
                    `- Semantic: ${result.semanticScore.toFixed(1)}%`,
                    `- Rubric: ${result.rubricScore.toFixed(1)}%`,
                    `- Similarity: ${result.similarity.toFixed(1)}%`,
                    review?.decision ? `- Review decision: ${review.decision}` : `- Review decision: pending`,
                    review?.note ? `- Reviewer note: ${review.note}` : `- Reviewer note: none`,
                    `- Expected output: ${testCase?.expectedOutput || "(missing)"}`,
                    `- Model response: ${result.response || "(empty)"}`,
                    ``,
                ];
            })),
    ];

    return sections.join("\n");
}

export function buildRunReportHtml(run: TestRun): string {
    const reviewCounts = getReviewedCounts(run);
    const topFailures = getTopFailures(run);

    const failureCards = topFailures.length === 0
        ? `<div class="empty">No failing cases in this run.</div>`
        : topFailures.map((result, index) => {
            const testCase = getTestCase(run, result.testCaseId);
            const review = getReview(run, result.testCaseId);
            return `
                <section class="failure-card">
                    <div class="eyebrow">Failure ${index + 1}</div>
                    <h3>${escapeHtml(testCase?.input || `Case ${index + 1}`)}</h3>
                    <div class="meta-grid">
                        <div><span>Final</span><strong>${escapeHtml(getFinalStatus(result, review))}</strong></div>
                        <div><span>Auto</span><strong>${escapeHtml(result.status)}</strong></div>
                        <div><span>Overall</span><strong>${result.overallScore.toFixed(1)}%</strong></div>
                        <div><span>Semantic</span><strong>${result.semanticScore.toFixed(1)}%</strong></div>
                        <div><span>Rubric</span><strong>${result.rubricScore.toFixed(1)}%</strong></div>
                        <div><span>Similarity</span><strong>${result.similarity.toFixed(1)}%</strong></div>
                    </div>
                    <div class="content-grid">
                        <div>
                            <h4>Expected Output</h4>
                            <p>${escapeHtml(testCase?.expectedOutput || "(missing)")}</p>
                        </div>
                        <div>
                            <h4>Model Response</h4>
                            <p>${escapeHtml(result.response || "(empty)")}</p>
                        </div>
                    </div>
                    <div class="review-box">
                        <strong>Reviewer decision:</strong> ${escapeHtml(review?.decision || "pending")}<br />
                        <strong>Reviewer note:</strong> ${escapeHtml(review?.note || "none")}
                    </div>
                </section>
            `;
        }).join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(run.name)} Report</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f7fb; color: #111827; margin: 0; padding: 32px; }
        .shell { max-width: 1100px; margin: 0 auto; }
        .hero, .panel, .failure-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
        .hero { margin-bottom: 24px; }
        .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top: 20px; }
        .metric { background: #f8fafc; border-radius: 18px; padding: 16px; }
        .metric span, .meta-grid span, .eyebrow { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 6px; }
        .metric strong, .meta-grid strong { font-size: 24px; }
        .panel { margin-bottom: 24px; }
        .prompt-block { white-space: pre-wrap; background: #0f172a; color: #f8fafc; border-radius: 18px; padding: 18px; font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
        .failure-card { margin-bottom: 18px; }
        .meta-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); margin: 16px 0 18px; }
        .content-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
        .content-grid p, .review-box { white-space: pre-wrap; line-height: 1.6; color: #374151; }
        .review-box { margin-top: 16px; background: #f8fafc; border-radius: 16px; padding: 14px; }
        .empty { color: #6b7280; padding: 16px 0; }
    </style>
</head>
<body>
    <div class="shell">
        <section class="hero">
            <div class="eyebrow">Promitly Shared Report</div>
            <h1>${escapeHtml(run.name)}</h1>
            <p>Generated ${escapeHtml(new Date().toLocaleString())} for a run originally executed on ${escapeHtml(new Date(run.timestamp).toLocaleString())}.</p>
            <div class="grid">
                <div class="metric"><span>Total cases</span><strong>${run.metrics.totalCases}</strong></div>
                <div class="metric"><span>Pass rate</span><strong>${run.metrics.passRate.toFixed(0)}%</strong></div>
                <div class="metric"><span>Avg overall</span><strong>${run.metrics.avgOverall.toFixed(1)}%</strong></div>
                <div class="metric"><span>Avg semantic</span><strong>${run.metrics.avgSemantic.toFixed(1)}%</strong></div>
                <div class="metric"><span>Avg rubric</span><strong>${run.metrics.avgRubric.toFixed(1)}%</strong></div>
                <div class="metric"><span>Avg similarity</span><strong>${run.metrics.avgSimilarity.toFixed(1)}%</strong></div>
                <div class="metric"><span>Pending reviews</span><strong>${reviewCounts.pending}</strong></div>
                <div class="metric"><span>Rejected reviews</span><strong>${reviewCounts.rejected}</strong></div>
            </div>
        </section>
        <section class="panel">
            <div class="eyebrow">Prompt Setup</div>
            <h2>System Prompt</h2>
            <div class="prompt-block">${escapeHtml(run.systemPrompt || "(empty)")}</div>
            <h2 style="margin-top:20px;">User Input Template</h2>
            <div class="prompt-block">${escapeHtml(run.userInput || "(empty)")}</div>
        </section>
        <section class="panel">
            <div class="eyebrow">Top Failures</div>
            <h2>Priority cases for review</h2>
            ${failureCards}
        </section>
    </div>
</body>
</html>
    `.trim();
}
