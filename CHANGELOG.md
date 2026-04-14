# Changelog

All notable changes to Promitly will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project currently uses semantic versioning from the public release line onward.

## [Unreleased]

### Planned

- CLI and CI-friendly prompt regression runs
- schema-aware output validation
- flaky-case detection and rerun workflows

## [0.1.0] - 2026-04-14

### Added

- local-first prompt QA workspace with datasets, saved prompt versions, results, and history
- multi-provider support for AWS Bedrock, OpenAI, Anthropic, and Google Gemini
- structured output validation for JSON, prefix, substring, and regex rules
- prompt comparison workflows, rubric scoring, analytics, reviews, schedules, and shared reports
- session-only runtime credential entry in the UI
- community health files, issue templates, PR template, CI workflow, launch-ready README, and release notes

### Changed

- refined public positioning around private local prompt testing
- improved contributor onboarding and GitHub discoverability assets

### Limitations

- persistence is still browser-local through IndexedDB
- scheduled runs execute while the app is open
- there is no multi-user backend yet
