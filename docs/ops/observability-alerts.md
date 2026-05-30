# Observability & Alert Matrix

## Key Metrics
1. Checkout conversion rate
2. Payment success rate by gateway (vnpay/momo/cod)
3. Payment failure rate by error code
4. Stock mismatch incidents/day
5. Order status transition latency

## Logging Requirements
- Structured JSON logs for:
  - order create
  - payment init
  - webhook receive/verify/result
  - checkout failure
- Include correlation IDs:
  - `orderId`, `paymentId`, `idempotencyKey`, `requestId`

## Alert Rules (initial)
- P1: Payment success rate drops below threshold for 10 min
- P1: Webhook verification failures spike
- P1: Checkout 5xx rate exceeds threshold
- P2: Elevated stock mismatch errors
- P2: Order creation latency degradation

## Dashboards
- Commerce overview dashboard
- Payment gateway dashboard
- Checkout funnel dashboard
- Error breakdown dashboard

## On-call Runbook Hooks
- Link each alert to runbook section.
- Include rollback steps and communication template.
