# Feature: add JSON Schema validation mode

Labels: enhancement

## Problem

Current structured validation covers JSON presence and string rules, but not full schema compliance.

## Proposed improvement

Add a JSON Schema validation option for outputs that must match a defined contract.

## Acceptance criteria

- users can paste or import a schema
- validation errors are shown clearly in results
- compare and analytics views reflect schema failures
