# Server README Template (Production Commerce)

## 1. Overview
- Purpose of service
- Tech stack
- Architecture summary (API, DB, queue, cache)

## 2. Domain Model
- Product, Inventory, Cart, Order, Payment, Fulfillment
- Business invariants

## 3. State Machines
- Order lifecycle states + transitions
- Payment lifecycle states + transitions
- Idempotency and replay handling

## 4. API Contracts
- Auth endpoints
- Products/listing/search/filter
- Orders/create/list/detail
- Payments/create/webhook
- Error response format

## 5. Environment Variables
- Required envs (DB, JWT, gateway keys, webhook secret)
- Optional envs (log level, feature flags)

## 6. Local Setup
- Install dependencies
- Run migrations
- Seed data
- Start dev server

## 7. Database & Migrations
- Migration strategy
- Rollback policy
- Seed strategy

## 8. Payment Integration
- Gateway setup
- Webhook signature verification
- Retry and idempotency policy

## 9. Security
- AuthN/AuthZ
- Rate limiting
- Input validation
- Secret management

## 10. Observability
- Structured logging
- Metrics
- Tracing
- Alerts and dashboards

## 11. Testing
- Unit tests
- Integration tests
- Contract tests
- E2E API smoke

## 12. CI/CD
- Required quality gates
- Deployment flow
- Rollback strategy

## 13. Incident Runbooks
- Payment outage
- Webhook backlog
- Inventory mismatch

## 14. Ownership
- Team owners
- On-call escalation
