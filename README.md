# Promitly

Promitly is a prompt QA platform for evaluating, comparing, reviewing, and reporting on prompt behavior against curated test suites. It combines automated scoring with human review so prompt changes can be treated more like a real quality workflow instead of one-off experimentation.

## Core capabilities

- Workspace for prompt authoring, rubric tuning, and test-case design
- Automated evaluation with semantic score, rubric score, overall score, latency, token usage, and cost
- Structured output validation for JSON, prefix, substring, and regex constraints
- Prompt versioning and saved datasets
- A/B comparison across prompt versions on the same dataset
- Human review workflow with reviewer notes and pass/fail overrides
- Shared HTML and Markdown run reports
- Dataset import/export in JSON and CSV
- Local app settings for evaluator defaults and rubric presets

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- `next-intl` for localization
- AWS Bedrock via the Vercel AI SDK
- IndexedDB for local persistence
- Vitest for automated tests

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
npm run test
```

## Product routes

- `/workspace`: author prompts, manage rubrics, and build test cases
- `/results`: inspect evaluation metrics and row-level outputs
- `/history`: browse saved runs and export reports
- `/compare`: run prompt version A/B comparisons
- `/datasets`: manage reusable suites and import/export them
- `/reviews`: add reviewer decisions, notes, and overrides
- `/settings`: manage default evaluator configuration and rubric presets

## Evaluation flow

1. Define a system prompt and user input template.
2. Add test cases with expected outputs and optional structured validation rules.
3. Choose or adjust rubrics, threshold, and model configuration.
4. Run evaluation to execute each case against the selected model.
5. Review semantic score, rubric score, overall score, similarity, latency, tokens, and cost.
6. Save versions, compare prompt variants, and add human review decisions.
7. Export datasets or generate shareable reports from saved runs.

## Architecture

Promitly is organized by responsibility rather than by a single page tree:

```txt
app/
  [locale]/(platform)/...   Route entry points and app shell
  api/                      Thin API handlers

features/
  dashboard/                Workspace, results, history
  compare/                  A/B comparison workbench
  datasets/                 Dataset management UI
  reviews/                  Human review workflow
  settings/                 App-level evaluator defaults
  runs/                     Shared run-loading hooks
  evaluation/               Client evaluation hook
  navigation/               Shell and route framing

server/
  lib/                      AI client and evaluator adapters
  services/                 Validation, evaluation, optimization, generation

shared/
  constants/                Models, defaults, rubric presets
  lib/                      Persistence, exports, reports, summaries, factories
  types/                    Shared domain types
  ui/                       Reusable UI primitives
```

## Persistence model

- Saved runs, datasets, prompt versions, and app settings are stored in IndexedDB.
- Persistence is browser-local by design right now.
- Reviews are attached to saved runs, so human QA context stays with the experiment it belongs to.
- Settings store evaluator defaults such as model, threshold, batch size, and default rubric preset.

## Testing strategy

Promitly now includes focused automated coverage around the most important pure logic:

- output validation
- dataset import/export parsing
- report generation
- API error/status mapping
- request-shape validation
- evaluation service behavior with mocked AI calls
- scoring/summary utilities
- fallback/default object factories

Run the test suite with:

```bash
npm run test
```

Note: in some restricted Windows sandbox environments, the test runner may require elevated execution even though the suite itself is healthy.

## Contributor notes

- API routes should stay thin and delegate parsing plus business logic to `server/services`.
- Shared math or repeated object construction should live in `shared/lib` instead of being duplicated across UI and service layers.
- When adding new evaluator behavior, prefer testing pure utilities directly and mocking the AI boundary in service tests.
- Persistence changes that affect IndexedDB must keep store version upgrades in sync.

## Current limitations

- Semantic scoring still depends on a second model call, so it is useful but not perfectly deterministic.
- Persistence is local to the browser because runs are stored in IndexedDB.
- There is still no backend multi-user storage or auth layer.
- Reports are exportable artifacts, but there is not yet a hosted share-link workflow.
