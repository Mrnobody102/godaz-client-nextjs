# Commerce Production Roadmap & Backlog

## Mục tiêu
Biến hệ thống hiện tại thành nền tảng bán hàng production-ready: đúng nghiệp vụ, ổn định vận hành, bảo mật, mở rộng tốt.

## Trạng thái hiện tại
- [x] Sidebar filter desktop + mobile filter sheet
- [x] Bộ test nền: Playwright E2E + Vitest API + CI workflow
- [x] Mở rộng dữ liệu demo để kiểm tra phân trang/filter
- [x] Backend catalog có filter/sort/pagination, validate `minPrice > maxPrice`, test controller.
- [x] Backend order đã tạo đơn, lock product khi checkout, trừ stock, lưu line-item price snapshot.
- [x] Backend payment đã có VNPAY/MoMo gateway, callback signature check, redirect success, email xác nhận.
- [x] Frontend đã có cart local, checkout, payment gateway selection, order history/profile cơ bản.

## Gap chính trước production
- Order/payment state trong docs chưa khớp code: docs dùng `pending_payment/paid/processing`, backend đang dùng `PENDING/CONFIRMED`, payment đang dùng `PENDING/SUCCESS/FAILED/CANCELLED`.
- Frontend đã gửi `X-Idempotency-Key` cho order/payment, nhưng backend chưa persist và chưa replay-safe ở cấp request.
- Stock hiện bị trừ ngay khi tạo order; chưa có reservation TTL, restore stock khi order hết hạn/hủy/thanh toán fail.
- Payment callback đã check signature nhưng chưa có event ledger/replay protection theo gateway event, chưa xử lý out-of-order event đầy đủ.
- Chưa có admin order console, audit log, fulfillment timeline, refund flow.
- Cart vẫn là local Zustand; chưa có server cart/guest merge/auth merge.
- Production ops mới ở mức checklist; chưa gắn metrics checkout/payment/order vào code path.

---

## Batch lớn tiếp theo — Commerce Core Production Spine (2-3 tuần)

### Mục tiêu batch
Biến checkout/order/payment từ flow demo thành lõi thương mại production: trạng thái chuẩn, idempotent, không oversell, có audit trail, có admin vận hành đơn, có test chống regression ở đường tiền.

### Vì sao đây là batch tiếp theo
Catalog/filter đã tương đối ổn và đã có test. Rủi ro production lớn nhất hiện nằm ở đường `cart -> order -> stock -> payment callback -> fulfillment`: chỉ cần duplicate request, callback lặp, fail payment, hoặc khách reload là có thể lệch tồn kho/trạng thái đơn. Batch này đóng xương sống nghiệp vụ trước khi mở rộng UI/marketing/CRM.

### Epic 1 — Chuẩn hóa state machine order/payment
- [x] Đổi hoặc map backend `OrderStatus` về state chuẩn: `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`.
- [x] Đổi hoặc map backend `PaymentStatus` về state chuẩn: `initiated`, `pending`, `authorized`, `captured`, `failed`, `expired`, `refunded`.
- [x] Tạo service transition guard: chỉ cho phép transition hợp lệ, reject forbidden transitions.
- [x] Viết migration an toàn cho dữ liệu cũ: `PENDING -> PENDING_PAYMENT`, `CONFIRMED -> PROCESSING`, `SUCCESS -> CAPTURED`.
- [x] FE bỏ dần `LEGACY_STATUS_MAP` khi API đã ổn định.

### Epic 2 — Idempotency nền cho write endpoints
- [x] Tạo bảng `idempotency_keys`: `key`, `username`, `endpoint`, `request_hash`, `response_body`, `status_code`, `expires_at`, timestamps.
- [x] Implement filter/interceptor cho `POST /api/orders` và `POST /api/payments`.
- [x] Same key + same payload trả lại response cũ, không tạo order/payment mới.
- [x] Same key + khác payload trả `409 Conflict`.
- [x] Thêm cleanup job cho key hết hạn.

### Epic 3 — Inventory reservation và stock correctness
- [x] Tách inventory thành `available_stock`, `reserved_stock`, hoặc tạo `inventory_reservations`.
- [x] Khi tạo order online payment: reserve stock TTL thay vì trừ vĩnh viễn ngay.
- [x] Khi payment captured: commit reservation và chuyển order sang `paid/processing`.
- [x] Khi payment failed/expired/cancelled: release reservation và chuyển order sang trạng thái terminal phù hợp.
- [x] Với COD: có policy riêng, có thể commit stock ngay hoặc reserve đến khi admin confirm.
- [ ] Thêm optimistic/pessimistic locking test cho concurrent checkout cùng product.

### Epic 4 — Payment event ledger và replay protection
- [x] Tạo bảng `payment_events`: gateway, event_id/hash, payment_id, payload, signature_valid, processed_at, processing_result.
- [x] Callback/IPN ghi event trước khi mutate order/payment.
- [x] Duplicate event là no-op có response thành công theo chuẩn gateway.
- [x] Amount mismatch/signature invalid lưu event thất bại, không mutate order.
- [x] Out-of-order event không được hạ trạng thái terminal.
- [x] Email xác nhận chỉ gửi đúng một lần khi transition sang captured/paid.

### Epic 5 — Order timeline, admin operations, audit log
- [x] Tạo `order_events`: order_id, actor_type, actor_id, from_status, to_status, reason, metadata, created_at.
- [x] Admin API: list orders, filter by status/date/payment, view detail timeline.
- [x] Admin API: confirm/process/ship/deliver/cancel/refund với permission check.
- [x] FE admin order screen: table, filters, detail drawer/page, timeline, action buttons theo trạng thái.
- [x] Customer order detail hiển thị timeline rõ ràng, payment status, shipping/contact snapshot.

### Epic 6 — Frontend checkout recovery
- [x] Checkout success page verify order/payment status từ backend, không chỉ tin query string.
- [x] Payment pending page cho gateway chậm callback.
- [x] Retry payment cho order `pending_payment` còn valid reservation.
- [x] Hết hạn reservation hiển thị CTA quay lại cart và refresh stock.
- [x] Cart local reconcile lại stock khi quay về từ failed/cancelled payment.

### Epic 7 — Test, observability, release gates
- [ ] Backend tests: state transition guard, idempotency, duplicate callback, amount mismatch, concurrent stock reservation.
- [x] FE Vitest: status mapping, checkout recovery branching, API error handling.
- [ ] Playwright: happy path checkout, empty cart, payment pending/fail simulation, order history.
- [x] Metrics: order_created, payment_initiated, payment_captured, payment_failed, reservation_expired, stock_release.
- [ ] Alerts: payment callback error spike, payment pending quá lâu, stock mismatch, order stuck in pending.

### Files likely touched
- Backend:
  - `domain/order/model/OrderStatus.java`
  - `domain/order/service/OrderService.java`
  - `domain/order/controller/OrderController.java`
  - `domain/payment/model/PaymentStatus.java`
  - `domain/payment/service/PaymentService.java`
  - `domain/payment/controller/PaymentController.java`
  - `domain/catalog/model/Product.java`
  - `src/main/resources/db/migration/*`
  - new: `domain/idempotency/*`, `domain/inventory/*`, `domain/order/model/OrderEvent.java`, `domain/payment/model/PaymentEvent.java`
- Frontend:
  - `lib/api.ts`
  - `stores/cartStore.ts`
  - `stores/orderStore.ts`
  - `app/[locale]/checkout/CheckoutClient.tsx`
  - `app/[locale]/checkout/success/CheckoutSuccessClient.tsx`
  - `app/[locale]/profile/ProfileClient.tsx`
  - new admin route under `app/[locale]/admin/orders/*`
- Tests:
  - `godas-server/src/test/java/.../OrderServiceTest.java`
  - new payment/idempotency/inventory tests
  - `tests/e2e/checkout-flow.spec.ts`
  - `tests/api/api.contract.test.ts`

### Definition of Done
- [x] Duplicate order/payment requests không tạo duplicate side effect.
- [x] Duplicate/replayed gateway callbacks không gửi email/trừ stock/chuyển trạng thái lần hai.
- [x] Không oversell khi nhiều user checkout cùng product.
- [x] Stock được release khi payment fail/expire/cancel.
- [x] Admin nhìn được toàn bộ timeline order/payment và thao tác trạng thái có audit.
- [x] Customer có recovery path rõ ràng cho success/pending/fail/cancel.
- [ ] CI chạy được backend service tests, FE API tests, Playwright checkout smoke.
- [ ] Có dashboard/alert tối thiểu cho checkout/payment incidents.

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
