# Testing Guide

## Test suites

### 1) API contract tests
- Command: `npm run test:api`
- Purpose: validate API mapping/util logic and error handling.

### 2) API integration tests (optional)
- Command: `RUN_INTEGRATION=1 npm run test:api`
- Requires backend reachable via `NEXT_PUBLIC_API_URL`.

### 3) UI/UX E2E tests
- Command: `npm run test:e2e`
- Uses Playwright with desktop + mobile Chromium projects.

### 4) Update visual baselines
- Command: `npm run test:e2e:update`

## Local prerequisites
1. Install dependencies: `npm install`
2. Install browser: `npx playwright install --with-deps chromium`

## CI gates
The CI workflow runs in this order:
1. Lint
2. Build
3. API tests
4. Playwright E2E tests

Artifacts uploaded on CI:
- `playwright-report`
- `test-results`
