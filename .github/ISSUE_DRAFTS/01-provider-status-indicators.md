# Feature: add provider status indicators in Settings and Workspace

Labels: enhancement, good first issue

## Problem

Users can select a provider before realizing whether credentials are available through env vars or runtime session fields.

## Proposed improvement

Show a small readiness state for each provider:

- ready from env
- ready from session credentials
- missing credentials

## Acceptance criteria

- status appears in `Workspace` and `Settings`
- no secret values are displayed
- messaging explains that session credentials are not persisted
