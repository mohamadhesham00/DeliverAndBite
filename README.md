# DeliverAndBite

Simplified food delivery platform built with NestJS, Nuxt 4, PostgreSQL, Prisma, Tailwind CSS, and Supabase Auth.

## Structure

- `server` — NestJS API, Prisma schema, auth guard, seed data, and order endpoints
- `web` — Nuxt 4 frontend with menu, checkout, and confirmation pages

## Local setup

1. Copy `.env.example` to `.env` and fill in your Supabase and database values.
2. Start PostgreSQL with `docker compose up -d`.
3. Install dependencies with `pnpm install`.
4. Run Prisma generation and seed from `server`.
5. Start the server and web apps.

## Environment variables

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_JWKS_URL`
- `SUPABASE_ISSUER`
- `SUPABASE_AUDIENCE`
- `API_PORT`
- `NUXT_PUBLIC_API_BASE`
- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY`

## GitHub push plan

1. Root scaffold and CI
2. Server API and database models
3. Web UI and cart flow
4. Validation, polish, and README finalization
