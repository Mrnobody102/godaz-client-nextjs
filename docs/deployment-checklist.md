# Production Deployment Checklist

Use this checklist before promoting the Next.js app to Vercel or a custom domain.

## Frontend environment

- `NEXT_PUBLIC_API_URL`: deployed backend origin, for example `https://api.example.com`.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: required only when Google login is enabled.
- `NEXT_PUBLIC_ENABLE_LOCAL_AUTH_FALLBACK`: keep `false` in production. Set `true` only for local demo auth testing.

## Backend environment

- CORS allowed origins must include the deployed frontend URL, including the final custom domain.
- Auth endpoints must return real JWT tokens for login/register/Google login.
- Admin APIs must require `ADMIN`; tokenless localStorage sessions are not supported in production.

## Release gates

- `npm run lint`
- `npm run test:encoding`
- `npm run test:api`
- `npm run build`
- `npm run audit:prod`
- `npm run test:e2e`
