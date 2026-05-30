# Commerce Production Roadmap & Backlog

## Mục tiêu
Biến hệ thống hiện tại thành nền tảng bán hàng production-ready: đúng nghiệp vụ, ổn định vận hành, bảo mật, mở rộng tốt.

## Trạng thái hiện tại
- [x] Sidebar filter desktop + mobile filter sheet
- [x] Bộ test nền: Playwright E2E + Vitest API + CI workflow
- [x] Mở rộng dữ liệu demo để kiểm tra phân trang/filter

---

## Phase 0 — Foundation Alignment (2-3 ngày)
### Deliverables
- Domain glossary + invariants
- Order/Payment state machines
- API contracts baseline

### Backlog
- [ ] Define entities: Product, Inventory, Cart, Order, Payment, Fulfillment
- [ ] Define business invariants and forbidden transitions
- [ ] Document order states: draft -> pending_payment -> paid -> processing -> shipped -> delivered -> cancelled -> refunded
- [ ] Document payment states: initiated -> pending -> authorized -> captured -> failed -> expired -> refunded
- [ ] Freeze request/response schemas for products/orders/payments/webhooks

### Acceptance Criteria
- [ ] Domain docs approved by FE + BE + Product
- [ ] No ambiguity in transition rules

---

## Phase 1 — Catalog & Filter Hardening (1 tuần)
### Backlog
- [ ] Lock filter/sort query semantics (`page`, `size`, `sort`, `minPrice`, `maxPrice`, `inStock`, `featured`)
- [ ] Server-side validate invalid ranges (`minPrice > maxPrice`)
- [ ] Ensure URL restore parity on refresh/share links
- [ ] Add SEO/canonical strategy for listing routes

### Files (likely)
- `app/[locale]/HomeClient.tsx`
- `components/ProductFilters.tsx`
- `lib/api.ts`

### Acceptance Criteria
- [ ] Deterministic listing behavior across reloads
- [ ] API mode and fallback mode parity for equivalent data

---

## Phase 2 — Cart & Inventory Correctness (1 tuần)
### Backlog
- [ ] Enforce stock checks at server boundary for cart + checkout
- [ ] Implement cart merge guest -> authenticated user
- [ ] Add inventory reservation on checkout init (TTL)
- [ ] Ensure idempotent cart mutations for retries

### Acceptance Criteria
- [ ] Cannot exceed server stock under concurrent requests

---

## Phase 3 — Checkout, Payment, Orchestration (2 tuần)
### Backlog
- [ ] Transaction-safe order creation with immutable line-item snapshot
- [ ] Payment intent decoupled from order finalization
- [ ] Webhook signature verification + replay protection
- [ ] Idempotent payment/order transitions
- [ ] Recovery flow for timeout/failure/cancel

### Acceptance Criteria
- [ ] Replayed events do not duplicate effects
- [ ] Order/payment states always valid by machine rules

---

## Phase 4 — Order Management & Post-purchase (1-2 tuần)
### Backlog
- [ ] Implement merchant order timeline states
- [ ] Admin state transitions with permission checks + audit logs
- [ ] Refund flows (partial/full)
- [ ] Customer order history quality improvements

### Acceptance Criteria
- [ ] Full lifecycle traceability via immutable event log

---

## Phase 5 — Quality Engineering (song song)
### Backlog
- [ ] Expand Playwright: listing/filter/pagination/product/cart/checkout
- [ ] Expand API contract tests for critical endpoints
- [ ] Gate merges by required CI checks
- [ ] Add perf smoke and accessibility smoke suites

### Acceptance Criteria
- [ ] CI required checks green for every PR

---

## Phase 6 — Security & Operations Hardening (song song)
### Backlog
- [ ] Harden auth/session and role checks
- [ ] Enforce write-endpoint schema validation
- [ ] Add rate limits (login/checkout/payment init)
- [ ] Set up observability dashboards + alert rules
- [ ] Publish incident runbooks

### Acceptance Criteria
- [ ] On-call can detect + triage payment/checkout incidents quickly

---

## Sprint Plan (4 tuần)
### Sprint 1
- [ ] Phase 0 complete
- [ ] Phase 1 contract + validations
- [ ] Listing/filter regression tests

### Sprint 2
- [ ] Phase 2 inventory/cart correctness
- [ ] Start Phase 3 orchestration skeleton

### Sprint 3
- [ ] Complete webhook reconciliation/idempotency
- [ ] Start order management timeline

### Sprint 4
- [ ] Complete post-purchase flows
- [ ] Security baseline + release readiness review

---

## KPI Tracking
- [ ] Checkout conversion rate
- [ ] Payment success rate by gateway
- [ ] Stock mismatch incidents/day
- [ ] Order processing SLA
- [ ] Regression escape rate

---

## Working Rules
- Mọi thay đổi nghiệp vụ phải có test (API contract + E2E impact).
- Mọi endpoint write phải có schema validation.
- Không merge nếu CI required checks fail.
- Mọi incident production phải có postmortem + action items.
