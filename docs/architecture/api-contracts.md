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

### Payload
- `items: [{ productId: number, quantity: number }]`
- `customer: { name, phone, address }`
- `paymentMethod: string`

### Rules
- Reject if stock insufficient.
- Return immutable order snapshot.

## Payment gateways
`GET /api/payments/gateways`

## Payment intent
`POST /api/payments`
- payload: `{ orderId: string, gateway: 'vnpay' | 'momo' }`
- return `paymentUrl` for redirect flow.

## Error handling baseline
- API error body should provide:
  - `message` (primary)
  - optional `errors[]`
- Frontend maps using `getApiErrorMessage` in `lib/api.ts`.
