# Contributing to Promitly

Thanks for contributing to Promitly. This project is building a local-first prompt QA platform for developers who want to test prompts privately, compare versions, validate outputs, and review runs without depending on a hosted prompt testing service.

## Before You Open a PR

1. Read the [README](./README.md) for product context and architecture.
2. Search existing issues before starting work.
3. For larger changes, open an issue first so we can avoid duplicated work.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

You can either:

- add provider env keys in `.env.local`, or
- enter runtime credentials in the app UI for the current session only

## Project Principles

- Keep API routes thin and move logic into `server/services`.
- Reuse shared abstractions in `shared/lib`, `shared/types`, and `shared/constants`.
- Add new model providers through the provider registry instead of branching logic across routes.
- Do not persist user-supplied runtime credentials.
- Preserve the product's local-first privacy story in copy, docs, and UX.
- Add tests for logic-heavy changes.

## Branches and Commits

- Keep branches focused on one problem.
- Use meaningful commits such as:
  - `feat: add provider status badges`
  - `fix: handle malformed compare payload`
  - `docs: tighten README hero copy`
- Prefer small, reviewable PRs over large mixed changes.

## Code Style Expectations

- Follow the domain-driven structure under `features`, `server`, and `shared`.
- Avoid duplicating summary math, validation rules, or fallback object factories.
- Keep comments short and only where they explain non-obvious intent.
- For UI changes, reuse existing primitives before creating new one-off components.
- Maintain the current visual language unless the issue is explicitly about design.

## Verification

Run all three before opening a PR:

```bash
npm run lint
npm run test
npm run build
```

## Pull Request Checklist

- Include screenshots or a short recording for UI changes.
- Note any persistence, schema, or migration impact.
- Update docs if behavior, setup, or positioning changes.
- Keep secrets out of commits, issues, screenshots, and exported artifacts.

## Good First Contribution Areas

- provider setup guidance and runtime credential UX
- accessibility improvements
- analytics and reporting polish
- dataset import and export ergonomics
- docs, onboarding, and launch content
