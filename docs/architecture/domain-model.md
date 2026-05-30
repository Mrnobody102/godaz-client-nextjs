# Domain Model & Business Invariants

## Core entities

### Product
- `id`, `name`, `category`, `categorySlug`, `price`, `unit`, `image`, `description`
- Optional: `stock`, `featured`

### Inventory
- Source of truth for available quantity.
- Must be validated server-side before order placement.

### Cart
- Contains line items (`productId`, `quantity`, `price snapshot for display only`).
- Guest cart may be stored client-side; authenticated cart should be server-reconciled.

### Order
- Immutable commercial snapshot at time of checkout:
  - line items (name, unit price, quantity)
  - totals
  - customer info
  - payment method

### Payment
- Linked to one order.
- State-driven lifecycle via gateway callbacks/webhooks.

### Fulfillment
- Shipping execution state after order is accepted/paid.

---

## Business invariants

1. Quantity ordered cannot exceed server-validated stock.
2. `minPrice` cannot be greater than `maxPrice` at both client and server boundaries.
3. Order line-item pricing must be immutable after order creation.
4. Payment transitions must be idempotent and replay-safe.
5. Order and payment states must remain compatible by state machine rules.

---

## Frontend responsibilities

- Keep URL/query and filter state deterministic.
- Prevent obvious invalid submissions (e.g., invalid price range).
- Surface clear error states from API.

## Backend responsibilities (contract)

- Enforce all commercial invariants as source of truth.
- Verify payment webhook signatures.
- Guard against duplicate state transitions.
