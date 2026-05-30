# Incident Runbooks

## 1) Payment Gateway Outage
### Symptoms
- Sudden increase in payment failures
- Users stuck at pending payment

### Immediate actions
1. Confirm gateway status page / API health.
2. Temporarily disable affected gateway in config.
3. Keep COD available as fallback.
4. Notify support/product channels.

### Recovery
- Re-enable gateway after health stabilizes.
- Reconcile pending orders and prompt users to retry payment.

---

## 2) Webhook Backlog / Verification Failures
### Symptoms
- Orders remain `pending_payment` too long
- Signature verification errors

### Immediate actions
1. Verify secret/key mismatch.
2. Pause non-critical processing.
3. Replay queued events once verification fixed.

### Recovery
- Run reconciliation script by `orderId/paymentId`.
- Audit for duplicate transitions.

---

## 3) Checkout Error Spike
### Symptoms
- Increased checkout failures
- 5xx errors at order/payment endpoints

### Immediate actions
1. Check latest deploy diff.
2. Roll back if regression confirmed.
3. Enable degraded mode (cash-only / hide failing method).
4. Communicate user-facing status banner.

### Recovery
- Patch root cause.
- Add regression tests for failure path.

---

## Postmortem Template
- Incident timeline
- Root cause
- User impact
- Detection gaps
- Corrective actions (owner + due date)
