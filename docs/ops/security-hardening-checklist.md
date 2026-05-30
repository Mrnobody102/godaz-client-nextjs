# Security Hardening Checklist (Phase 6)

## Auth & Session
- [ ] Enforce secure cookie flags in production (`HttpOnly`, `Secure`, `SameSite=Lax/Strict`).
- [ ] Define token expiry + refresh flow.
- [ ] Add logout-all-sessions support (server-side token invalidation).
- [ ] Require role checks on protected business routes.

## API Input Safety
- [ ] Validate all write endpoints with schema (zod/joi/class-validator).
- [ ] Reject invalid `minPrice > maxPrice` server-side.
- [ ] Normalize/trim customer fields before persistence.
- [ ] Return stable error shape: `{ message, errors[] }`.

## Abuse & Fraud Controls
- [ ] Rate limit login endpoint.
- [ ] Rate limit checkout + payment-init endpoints.
- [ ] Add request fingerprinting for repeated failed payments.
- [ ] Add captcha fallback for suspicious login patterns.

## Payment/Webhook
- [ ] Verify webhook signatures.
- [ ] Implement replay protection (idempotency key / event id dedupe).
- [ ] Ensure idempotent order/payment state transitions.
- [ ] Persist raw webhook payload for audit/debug.

## Secrets & Config
- [ ] Move all secrets to env manager (never in repo).
- [ ] Rotate API keys periodically.
- [ ] Add .env.example with non-sensitive placeholders.
- [ ] Add startup validation for required env vars.

## Dependency & Supply Chain
- [ ] Enable Dependabot security updates.
- [ ] Add npm audit gate in CI (warn/fail policy defined).
- [ ] Pin critical dependency versions where needed.

## Verification
- [ ] Security smoke in CI passes.
- [ ] Manual attack-surface review done each release.
