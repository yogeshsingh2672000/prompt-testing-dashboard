# Promitly

Promitly is a prompt testing dashboard for evaluating prompt quality against curated test cases. It helps compare generated responses with expected outputs using semantic scoring, embedding similarity, latency, token usage, and estimated cost.

## What it does

- Run prompt evaluations against a suite of test cases
- Measure similarity, semantic alignment, latency, and cost per case
- Generate additional test cases with AI
- Suggest prompt improvements based on evaluation results
- Save historical runs in IndexedDB for local analysis
- Export results as CSV or JSON

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- `next-intl` for localization
- AWS Bedrock via the Vercel AI SDK
- IndexedDB for local persistence

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
.env.local
```

3. Add the AWS / Bedrock credentials your environment expects.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Evaluation flow

1. Define a system prompt and user input template.
2. Add test cases with expected outputs.
3. Run evaluation to execute each case against the selected model.
4. Review pass/fail status, semantic score, similarity, latency, tokens, and cost.
5. Export or iterate on the prompt using the optimization workflow.

## Current limitations

- Semantic scoring still depends on a second model call, so it is useful but not perfectly deterministic.
- Persistence is local to the browser because runs are stored in IndexedDB.
- There is not yet a dedicated automated test suite for evaluator behavior.
