# Commerce Production Roadmap

## Mục Tiêu

Đưa goDaz từ flow demo thành nền tảng bán hàng có thể vận hành thật: trạng thái đơn hàng rõ ràng, checkout không lệch tồn kho, payment callback an toàn, admin có công cụ xử lý đơn, và CI có test chặn regression.

## Trạng Thái Hiện Tại

- [x] Catalog listing có filter, sort, pagination và test controller.
- [x] Cart local, checkout, payment gateway selection, order history/profile cơ bản.
- [x] Order tạo line-item snapshot, kiểm tra stock server-side, không oversell khi concurrent checkout.
- [x] Inventory reservation cho online payment, release/commit theo payment outcome.
- [x] Idempotency cho write endpoints quan trọng.
- [x] Payment callback có signature check, event ledger, duplicate callback no-op, amount mismatch không capture.
- [x] Admin order console có filter, transition action, timeline.
- [x] Metrics commerce đã gắn vào order/payment/reservation/stock paths.
- [x] Prometheus alert rule seeds cho payment và inventory incidents.

## Batch 1 — Commerce Core Production Spine

Mục tiêu batch này là làm chắc đường tiền: `cart -> order -> stock -> payment -> fulfillment`.

### Epic 1 — Order/Payment State Machine

- [x] Chuẩn hóa order statuses: `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`.
- [x] Chuẩn hóa payment statuses: `initiated`, `pending`, `authorized`, `captured`, `failed`, `expired`, `refunded`.
- [x] Transition guard reject trạng thái không hợp lệ.
- [x] Audit trail qua `order_events`.

### Epic 2 — Idempotency

- [x] Bảng `idempotency_keys`.
- [x] Same key + same payload trả response cũ.
- [x] Same key + khác payload trả `409 Conflict`.
- [x] Cleanup key hết hạn.
- [x] Unit/service test cho replay và conflict.

### Epic 3 — Inventory Correctness

- [x] Inventory reservation cho online payment.
- [x] COD commit stock ngay theo policy hiện tại.
- [x] Payment captured commit reservation.
- [x] Payment failed/expired/cancelled release reservation.
- [x] Refund restock inventory.
- [x] Concurrent checkout test chống oversell.

### Epic 4 — Payment Event Ledger

- [x] Bảng `payment_events`.
- [x] Callback ghi event trước khi mutate payment/order.
- [x] Duplicate callback là no-op.
- [x] Amount mismatch đánh failed, không capture.
- [x] Invalid signature không mutate payment.

### Epic 5 — Admin Operations

- [x] Admin list/filter orders.
- [x] Admin transition order status có audit reason.
- [x] Refund flow cập nhật payment refund fields, restock, gửi email khi cấu hình email.
- [x] Customer order response có timeline/payment/reservation/refund metadata.

### Epic 6 — Frontend Checkout Recovery

- [x] Checkout success verify order/payment từ backend.
- [x] Pending payment handling.
- [x] Retry payment cho order còn reservation.
- [x] Cart reconcile stock khi quay lại từ failed/cancelled payment.

### Epic 7 — Release Gates, Tests, Observability

- [x] Backend tests: transition guard, idempotency, duplicate callback, amount mismatch.
- [x] Backend concurrent stock locking test.
- [x] FE API contract test.
- [x] Playwright checkout smoke dùng stable test ids.
- [x] Prometheus alert rules cho payment failure/capture gap/reservation expiry/stock release spike.
- [x] CI backend và frontend gate optional deploy/Sonar bằng config thật.

### Batch A verification (spine hardening)

- Toàn bộ 37 backend test chạy xanh trên JDK 21 (`./mvnw test`): transition guard, idempotency replay/conflict, duplicate callback, amount mismatch, invalid signature, refund restock, concurrent oversell.
- Fix bug môi trường test: gỡ `MODE=PostgreSQL` khỏi URL H2 trong `application-test.yml`. H2Dialect render lock `for no key update` (cú pháp Postgres) khi ở mode này, khiến mọi test dùng `PESSIMISTIC_WRITE` fail. Đây là lý do backend test trước đây chưa từng pass.
- Refund hiện là manual settlement + auto restock (không gọi API gateway). Tiền hoàn xử lý thủ công ngoài hệ thống; reason được ghi vào `order_events` và `payment.refund_reason`.
- Rate limit phủ thêm `POST /api/payments` (5 req/phút/IP).

## Batch 1 Remaining Notes

- [x] Fix `district` field drift: migration V7 có `district`, backend entity/API đã map field này.
- [ ] Dọn encoding mojibake trong UI copy/messages. Đây là quality task riêng vì ảnh hưởng nhiều file text.
- [ ] Làm CI E2E required check khi Playwright suite ổn định trên GitHub runner.

## Batch 2 — Storefront Merchandising & Operations

Không nên trộn Batch 2 vào Batch 1 release gate. Batch 2 là feature batch lớn, cần migration/API/UI/test riêng.

### Blocker 1 — Admin Catalog CRUD

Trạng thái: Done.

Phạm vi đề xuất:
- Category CRUD endpoints.
- Product CRUD endpoints.
- Admin `/admin/products` page.
- Image URL/gallery field trước; upload binary để batch sau nếu chưa có storage thật.
- Audit logging cho write actions.

Acceptance:
- Admin thêm/sửa/xóa product/category không cần seed SQL.
- Product list/detail frontend dùng data do admin tạo.
- Tests cho create/update/delete và validation.

### Blocker 2 — Shipping Method & Fee

Trạng thái: Done in Super Batch 2.

Phạm vi đề xuất:
- `shipping_methods` hoặc config table.
- Order lưu `shipping_method`, `shipping_fee`, `subtotal`, `total_amount`.
- Checkout FE hiển thị phí ship và tổng cuối.
- API validate shipping method còn active.

Acceptance:
- Order total = subtotal - discount + shipping fee.
- Admin/customer order detail hiển thị shipping snapshot.

### Important — Coupon/Discount

Trạng thái: Done in Super Batch 2.

Phạm vi đề xuất:
- Coupon entity: code, type, value, min subtotal, max discount, usage limit, active window.
- Validate/apply coupon at checkout.
- Admin CRUD coupon tối thiểu.

Acceptance:
- Coupon invalid/expired/over limit trả lỗi rõ ràng.
- Order lưu discount snapshot, không phụ thuộc coupon thay đổi sau này.

### Important — Address Book

Trạng thái: Done in Super Batch 2.

Phạm vi đề xuất:
- `user_addresses` table.
- Multiple saved addresses per user.
- Default address.
- Checkout chọn saved address hoặc nhập guest address.

Acceptance:
- Auth user có thể lưu/chọn địa chỉ.
- Guest checkout vẫn hoạt động bằng snapshot address.

### Quick Win — Customer Order Detail

Trạng thái: Done in Super Batch 2.

Phạm vi đề xuất:
- Route `/profile/orders/[id]`.
- Render order items, payment status, reservation/refund metadata, timeline.

Acceptance:
- Customer xem được chi tiết và timeline đơn của mình.

## Full Commerce Gaps

| Hạng Mục | Trạng Thái | Mức Chặn |
| --- | --- | --- |
| Admin product/category CRUD | Done | Blocker |
| Shipping method + fee | Done | Blocker |
| Coupon/discount | Done | Important |
| Address book | Done | Important |
| Product variants/gallery/SKU/brand | Done in Mega Batch | Important tùy ngành hàng |
| Customer order detail route | Done | Quick win |
| Server cart + guest/auth merge | Done | Later |
| Admin dashboard/analytics | Done | Later |

## Working Rules

- Mọi thay đổi nghiệp vụ phải có backend test hoặc API contract test phù hợp.
- Mọi thay đổi checkout/payment/order phải có ít nhất một E2E hoặc smoke test nếu ảnh hưởng UI.
- Mọi endpoint write phải có validation và idempotency nếu có thể retry.
- CI build/test phải pass; deploy/scan chỉ chạy khi secrets/config thật đã bật.
