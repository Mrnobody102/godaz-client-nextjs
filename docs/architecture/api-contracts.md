# API Contracts (Frontend-facing baseline)

## Products listing
`GET /api/products`

### Query params
- `search?: string`
- `category?: string` (slug)
- `sort?: 'newest' | 'price-asc' | 'price-desc'`
- `page?: number` (0-based)
- `size?: number` (allowed: 12/24/48 current FE)
- `minPrice?: number`
- `maxPrice?: number`
- `inStock?: boolean`
- `featured?: boolean`

### Contract rules
- If `minPrice > maxPrice`, API should return validation error (4xx).
- Response must include `products`, `categories`, `totalElements`, `totalPages`, `page`, `size`.

## Product detail
`GET /api/products/{id}`

## Order creation
`POST /api/orders`

Header:
- `X-Idempotency-Key?: string`

### Payload
- `items: [{ productId: number, quantity: number }]`
- `customer: { name, phone, address }`
- `paymentMethod: string`

### Rules
- Reject if stock insufficient.
- Return immutable order snapshot.
- Same idempotency key + same payload returns original response.
- Same idempotency key + different payload returns `409 Conflict`.

### Response additions
- `status`: `pending_payment | paid | processing | shipped | delivered | cancelled | refunded`
- `paymentStatus?: initiated | pending | authorized | captured | failed | expired | refunded`
- `reservationExpiresAt?: string`
- `events[]`: immutable order timeline entries.

## Payment gateways
`GET /api/payments/gateways`

## Payment intent
`POST /api/payments`
Header:
- `X-Idempotency-Key?: string`

- payload: `{ orderId: string, gateway: 'vnpay' | 'momo' }`
- return `paymentUrl` for redirect flow.

## Admin order operations
`GET /api/admin/orders?status&paymentMethod&createdFrom&createdTo&page&size`
- `createdFrom`/`createdTo` use `YYYY-MM-DD`.

`GET /api/admin/orders/{id}`

`POST /api/admin/orders/{id}/transitions`
- payload: `{ status, reason? }`
- requires `ADMIN` authority.
- transitions are state-machine guarded and audit-logged.

## Error handling baseline
- API error body should provide:
  - `message` (primary)
  - optional `errors[]`
- Frontend maps using `getApiErrorMessage` in `lib/api.ts`.
