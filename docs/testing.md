# Testing Guide

## Test suites

### 1) API contract tests
- Command: `npm run test:api`
- Purpose: validate API mapping/util logic and error handling.

### 2) Encoding smoke
- Command: `npm run test:encoding`
- Purpose: reject mojibake regressions in Vietnamese UI, docs, tests, and CI files.

### 3) Production dependency audit
- Command: `npm run audit:prod`
- Purpose: fail on production `high` or `critical` vulnerabilities. Moderate/low findings are reported but do not block this gate.

### 4) API integration tests (optional)
- Command: `RUN_INTEGRATION=1 npm run test:api`
- Requires backend reachable via `NEXT_PUBLIC_API_URL`.

### 5) UI/UX E2E tests
- Command: `npm run test:e2e`
- Uses Playwright with desktop + mobile Chromium projects.
- Includes admin route smoke coverage for `/admin`, `/vi/admin`, `/admin/orders`, and `/vi/admin/orders`.
- Includes auth/session smoke coverage for stale localStorage sessions and expired-token `401` handling.

### 6) Update visual baselines
- Command: `npm run test:e2e:update`

## Local prerequisites
1. Install dependencies: `npm install`
2. Install browser: `npx playwright install --with-deps chromium`

## CI gates
The CI workflow runs in this order:
1. Lint
2. Encoding smoke
3. API tests
4. Build
5. Production dependency audit
6. Playwright E2E tests

Artifacts uploaded on CI:
- `playwright-report`
- `test-results`
