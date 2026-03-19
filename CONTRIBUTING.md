# Contributing to Promitly

Thanks for helping improve Promitly. This project is building an open-source prompt evaluation platform for prompt testing, prompt QA, LLM regression tracking, and prompt comparison workflows.

## Before you start

1. Read the README for the product and architecture overview.
2. Search open issues before starting new work.
3. Open a feature request or bug report first for larger changes so contributors do not duplicate effort.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add the environment values your Bedrock setup needs in `.env.local`.

## Project principles

- Keep API routes thin.
- Put domain logic in `server/services` or `shared/lib`.
- Reuse existing feature folders before creating new top-level structures.
- Preserve existing visual language unless the change is explicitly a design refactor.
- Add tests for logic-heavy changes.

## Pull request guidance

- Keep PRs focused.
- Include screenshots for UI changes.
- Mention any persistence or schema changes clearly.
- Run:

```bash
npm run lint
npm run test
npm run build
```

## Good first contribution areas

- Prompt evaluation UX polish
- Analytics and reporting improvements
- Dataset import/export workflows
- SEO and documentation improvements
- Test coverage for shared utilities and services

## Code style notes

- Prefer domain-driven files under `features`, `server`, and `shared`.
- Avoid duplicating summary math, request parsing, or fallback object construction.
- Keep comments concise and only where they clarify non-obvious logic.
