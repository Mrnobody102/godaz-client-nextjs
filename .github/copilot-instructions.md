# GitHub Copilot / AI Agent Guidance for godaz-client

Purpose: quick, actionable notes to help an AI coding agent be productive immediately in this repo.

## High level
- Next.js (App Router, Next 15) app in `app/`. Pages are server components by default; use `"use client"` at the top of files that must run in the browser.
- Project uses TypeScript, React 19 and Tailwind. Path alias `@/` = repo root (see `tsconfig.json`).
- UI primitives live in `components/ui/*` (shadcn-like primitives: `Button`, `Card`, `Input`, etc.). Use `cn` from `lib/utils.ts` for class merging.

## Data fetching & caching
- HTTP client: `lib/api.ts` (axios instance). Base URL uses `NEXT_PUBLIC_API_URL` (fallback `http://localhost:8080/api`).
  - Example: `import api from '@/lib/api'; const { data } = await api.get('/products');`
  - Note: `lib/api` reads token from `localStorage` and sets `Authorization: Bearer <token>`. That only works on client-side calls — server-side code should not rely on `localStorage`.

- React Query: global `QueryClient` in `lib/queryClient.ts` (default retry=1, staleTime=5min). There is a client wrapper `components/query-client-provider.tsx` that exports a client-only provider (``use client``) — wrap client components or client layouts with it when using `useQuery`/`useMutation`.
  - Example pattern: create a small client layout wrapper and render `<ClientQueryProvider> ... </ClientQueryProvider>` around children.

## State management
- Global small-state uses `zustand`. Example store: `stores/cartStore.ts` with `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
  - When updating cart UI, prefer using `useCartStore()` from components.

## Validation / forms
- Zod is used for validation (`lib/validators.ts`) and `react-hook-form` is installed. Look at `signInFormSchema` / `insertProductSchema` for patterns/shape of data.

## Auth
- `next-auth` is a dependency. The API route `app/api/auth/[...nextauth]/route.ts` simply re-exports `handlers` from `@/auth` (i.e. `import { handlers } from '@/auth'`).
  - I couldn't find an `auth` module in the repo — this is an important open question: where are the NextAuth handlers defined (external package, sibling repo, or missing file)?
  - Note: client `lib/api.ts` uses `localStorage` token; clarify whether the app uses cookie-based sessions (recommended for SSR) or expects tokens in localStorage (client-only).

## Styling & assets
- Global styles: `assets/styles/globals.css`. Tailwind config is in `tailwind.config.js`. Use `cn()` util and Tailwind classes for composition.
- Fonts via `next/font` (see `app/layout.tsx` using `Inter`).

## Workflows & scripts
- Start dev: `npm run dev` (Next server on :3000)
- Build: `npm run build` and `npm run start` for production
- Lint & format: `npm run lint`, `npm run format` (Husky + lint-staged are configured to run on staged TypeScript files)

## Conventions & small patterns
- File alias `@/` is preferred for imports (`@/lib/api`, `@/components/ui/button`).
- Keep server logic in server components or `app/api/*` route handlers; avoid calling browser-only things (e.g., `localStorage`) from server code.
- Client components must include `"use client"` and import only client-safe modules (e.g. `react-query` client wrappers, `localStorage` access, etc.).
- Use zod schemas from `lib/validators.ts` for form and API payload validation.

## Where to add features / fixes (practical examples)
- Add a new product list page: prefer server component that fetches from the API server-side (in layout/page server code) and renders child client components for interactive parts (wrap interactive parts with `ClientQueryProvider` and use queries).
- Add network call from client code: `import api from '@/lib/api'; await api.post('/cart', payload)` — but be aware the token header will only be present on client.
- To add global query usage: export ClientQueryProvider and include it in a client layout (e.g., under `app/(root)/layout.tsx` in a small client wrapper) or in the component tree where queries are used.

## Known unknowns / things to confirm
- Where are the NextAuth `handlers` (imported from `@/auth`)? This repo doesn't contain an `auth` module; confirm if authentication logic is external or intentionally omitted.
- Which auth/token strategy is expected for SSR (cookies) vs client (localStorage)? This influences where tokens are attached and how server calls are done.
- Are there any CI or test frameworks preferred? There are no tests or workflows in `.github/` currently.

---
If any section above is unclear or you want me to expand examples (small code snippets for wrapping with QueryClient, server-side fetching examples, or how to implement auth handlers), tell me which part to expand and I'll iterate. ✅
