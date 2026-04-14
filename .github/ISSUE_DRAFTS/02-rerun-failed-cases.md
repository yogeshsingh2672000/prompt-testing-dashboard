# Feature: rerun only failed cases from a saved run

Labels: enhancement

## Problem

Large suites are expensive to rerun when only a handful of cases failed.

## Proposed improvement

Allow users to rerun only failed cases from a saved run or review session.

## Acceptance criteria

- available from `History` and `Reviews`
- preserves the original suite and prompt version reference
- shows a delta against the original run
