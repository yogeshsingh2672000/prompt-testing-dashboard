# Promitly

Promitly is an open-source, local-first prompt evaluation platform for prompt testing, prompt comparison, prompt regression tracking, structured output validation, and human review workflows. It was built for developers who want to test prompts privately in their own environment instead of exposing prompt logic to a third-party hosted prompt testing platform.

## Why Promitly

- Keep prompt logic inside your own local environment
- Test prompts against reusable suites before shipping
- Compare prompt versions side by side
- Validate JSON and other structured output formats
- Track prompt quality trends, regressions, and reviewer decisions
- Run an open-source prompt QA workflow in a modern Next.js app

If you are searching for a prompt testing dashboard, prompt evaluation tool, private prompt testing platform, or open-source LLM QA platform, Promitly is designed for exactly that use case.

## The story behind Promitly

Promitly started from a simple problem: developers needed a way to evaluate prompts locally without exposing sensitive prompt logic to the world through another hosted platform.

That is the real USP of this project.

Promitly gives developers a secluded, local-first prompt QA environment where they can:

- test prompts privately
- compare prompt versions
- run prompt regression checks
- validate structured outputs
- review model behavior before release

The goal is not just better prompt evaluation. The goal is private prompt evaluation with full control.

## Core capabilities

- Local-first prompt testing workflow for private prompt evaluation
- Workspace for prompt authoring, rubric tuning, and test-case design
- Automated evaluation with semantic score, rubric score, overall score, latency, token usage, and cost
- Structured output validation for JSON, prefix, substring, and regex constraints
- Prompt versioning and saved datasets
- A/B comparison across prompt versions on the same dataset
- Trend analytics, regression summaries, and model leaderboards
- Scheduled evaluation configs for recurring prompt checks
- Human review workflow with reviewer notes and pass/fail overrides
- Shared HTML and Markdown run reports
- Dataset import/export in JSON and CSV
- Local app settings for evaluator defaults and rubric presets
- Public marketing landing page, sitemap, robots, manifest, and structured SEO metadata

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
cp .env.example .env.local
```

3. Add the AWS / Bedrock credentials your environment expects.
4. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` before deploying so canonical URLs, sitemap entries, and social metadata point to your real domain.

5. Start the app:

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
npm run test:coverage
```

## Product routes

- `/`: public landing page for search engines, social sharing, and contributor discovery
- `/workspace`: author prompts, manage rubrics, and build test cases
- `/results`: inspect evaluation metrics and row-level outputs
- `/analytics`: track trends, regressions, rubric analytics, and model comparisons
- `/history`: browse saved runs and export reports
- `/compare`: run prompt version A/B comparisons
- `/datasets`: manage reusable suites and import/export them
- `/schedules`: create recurring prompt checks from saved prompt versions
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
- Scheduled evaluations are also stored locally in IndexedDB.
- Persistence is browser-local by design right now, which supports the product's local-first and privacy-focused workflow.
- Reviews are attached to saved runs, so human QA context stays with the experiment it belongs to.
- Settings store evaluator defaults such as model, threshold, batch size, and default rubric preset.
- Because persistence is local, scheduled runs execute while the app is open rather than from a remote job runner.

## SEO and discoverability

Promitly now includes:

- localized metadata and route titles
- a public landing page with search-friendly copy
- `robots.txt`, `sitemap.xml`, and `manifest.webmanifest`
- JSON-LD structured data for `WebSite` and `SoftwareApplication`
- social preview assets for Open Graph and Twitter cards
- contributor-facing GitHub templates and community files

For production SEO, set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

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
- Metadata, sitemap, and public discoverability changes should stay consistent with `shared/constants/site.ts`.

## Open-source files

The repository now includes:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `LICENSE`
- GitHub issue templates
- a pull request template

## Current limitations

- Semantic scoring still depends on a second model call, so it is useful but not perfectly deterministic.
- Persistence is local to the browser because runs are stored in IndexedDB.
- There is still no backend multi-user storage or auth layer.
- Reports are exportable artifacts, but there is not yet a hosted share-link workflow.
- Scheduled evaluations are browser-local rather than server-cron based.
