# State Machines

## Order state machine

`draft -> pending_payment -> paid -> processing -> shipped -> delivered`

Alternative terminal flows:
- `pending_payment -> cancelled`
- `paid -> refunded` (full)
- `processing/shipped -> refunded` (partial/full, policy dependent)

### Forbidden examples
- `delivered -> pending_payment`
- `cancelled -> paid`
- `refunded -> processing`

## Payment state machine

`initiated -> pending -> authorized -> captured`

Alternative terminal flows:
- `pending -> failed`
- `pending -> expired`
- `captured -> refunded`

### Idempotency rules
- Repeated webhook for same transition must be no-op.
- Out-of-order events must not break valid terminal states.

## Compatibility matrix (high level)

- Order `pending_payment` can pair with payment `initiated|pending|authorized`.
- Order `paid|processing|shipped|delivered` requires payment `captured` (except COD policy).
- Order `cancelled` may pair with payment `failed|expired|refunded` depending gateway outcome.
