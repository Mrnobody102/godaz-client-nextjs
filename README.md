# Godaz Client

Frontend web app cho Godaz, cửa hàng thương mại điện tử bán gốm sứ Bát Tràng. Ứng dụng cung cấp storefront cho khách hàng, checkout, thanh toán, quản lý tài khoản, lịch sử đơn hàng và màn hình admin xử lý đơn.

## Nội Dung

- [Tính Năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Yêu Cầu](#yêu-cầu)
- [Cài Đặt Local](#cài-đặt-local)
- [Biến Môi Trường](#biến-môi-trường)
- [Scripts](#scripts)
- [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
- [Testing](#testing)
- [Tài Liệu Liên Quan](#tài-liệu-liên-quan)

## Tính Năng

- Trang chủ và danh sách sản phẩm có filter, sort, search và pagination.
- Trang chi tiết sản phẩm, đánh giá sản phẩm và trạng thái tồn kho.
- Giỏ hàng local, wishlist và checkout.
- Đăng nhập/đăng ký bằng API backend, hỗ trợ Google login.
- Tạo đơn hàng, chọn phương thức thanh toán COD/VNPay/Momo và xử lý checkout success.
- Hồ sơ người dùng, cập nhật thông tin nhận hàng và lịch sử đơn.
- Admin order console có lọc đơn, xem timeline và chuyển trạng thái đơn.
- Hỗ trợ đa ngôn ngữ qua `next-intl`.
- API client tập trung qua Axios và React Query.

## Tech Stack

| Thành phần | Công nghệ |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, Radix UI |
| State | Zustand, React Query |
| Form/Validation | React Hook Form, Zod |
| Auth | NextAuth integration, backend JWT flow |
| HTTP Client | Axios |
| i18n | next-intl |
| Test | Vitest, Playwright |
| Lint/Format | ESLint, Prettier, Husky |

## Yêu Cầu

- Node.js phiên bản phù hợp với Next.js hiện tại.
- npm.
- Backend Godas Server chạy tại `http://localhost:8080` hoặc URL được cấu hình qua env.

## Cài Đặt Local

Tạo file môi trường:

```bash
cp .env.example .env
```

Cài dependencies:

```bash
npm install
```

Chạy dev server:

```bash
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:3000
```

## Biến Môi Trường

| Biến | Mục đích |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL của backend API |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Client ID cho login phía client |

Xem đầy đủ tại [.env.example](./.env.example).

## Scripts

```bash
# Chạy development server
npm run dev

# Build production bundle
npm run build

# Chạy production server sau khi build
npm run start

# Lint
npm run lint

# API/contract tests bằng Vitest
npm run test:api

# E2E tests bằng Playwright
npm run test:e2e

# Format source code
npm run format
```

## Cấu Trúc Thư Mục

```text
app
├── [locale]              # Route theo ngôn ngữ: home, product, checkout, profile, admin
├── api                   # API routes Next.js
└── (auth), (root)        # Route groups
components                # Shared UI và feature components
contexts                  # React contexts
lib                       # API client, validators, constants, utils
stores                    # Zustand stores: cart, order, wishlist
messages                  # File dịch vi/en
tests
├── api                   # Contract/integration tests
└── e2e                   # Playwright specs
docs                      # Tài liệu kiến trúc, testing, ops và roadmap
```

## Testing

Chạy API/contract tests:

```bash
npm run test:api
```

Chạy E2E tests:

```bash
npm run test:e2e
```

Playwright cần frontend và backend đang chạy với dữ liệu phù hợp cho luồng checkout.

## Tài Liệu Liên Quan

- [Testing Guide](./docs/testing.md)
- [Domain Model & Invariants](./docs/architecture/domain-model.md)
- [Order/Payment State Machines](./docs/architecture/state-machines.md)
- [API Contracts Baseline](./docs/architecture/api-contracts.md)
- [Commerce Production Roadmap](./docs/commerce-production-roadmap.md)
