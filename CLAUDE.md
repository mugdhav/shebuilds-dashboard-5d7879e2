# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SheBuilds Hackathon Dashboard — a real-time event dashboard with a public view and a password-protected admin panel. Built with Vite + React + TypeScript + Supabase.

## Commands

```bash
npm run dev        # Dev server at http://localhost:8080
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Run tests once (Vitest)
npm run test:watch # Watch mode
```

## Architecture

### Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | `Dashboard.tsx` | Public |
| `/admin` | `AdminPanel.tsx` | Password-protected (see below) |
| `/submit` | `BuilderSubmit.tsx` | Public |
| `/prep` | `Prep.tsx` | Public |

### Admin Authentication Flow

`/admin` is wrapped in `AdminAuthGuard` (`src/components/AdminAuth.tsx`). It calls `supabase.auth.signInWithPassword` with the hardcoded email `admin@shebuilds.com`. The session JWT is stored in **sessionStorage** (lost on tab close — by design).

**The `admin@shebuilds.com` user must be manually created in the Supabase Auth dashboard.** There is no migration or seed that creates it.

### Admin Mutations Edge Function

All admin writes go through a single Supabase Edge Function at `supabase/functions/admin-mutations/index.ts`. The client (`src/lib/adminApi.ts`) passes the session JWT as `Authorization: Bearer <token>`. The function validates the JWT via `db.auth.getUser(token)` then uses the **service role key** to bypass RLS and perform writes.

**For admin operations to work, the Edge Function must:**
1. Be deployed: `supabase functions deploy admin-mutations`
2. Have `SUPABASE_SERVICE_ROLE_KEY` set as a secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>`

### Why Admin Operations Fail (Root Causes)

1. **Admin user not created** — `admin@shebuilds.com` does not exist in Supabase Auth → login fails → no JWT → all operations fail.
2. **Edge Function not deployed** — calls to `/functions/v1/admin-mutations` return 404.
3. **Missing `SUPABASE_SERVICE_ROLE_KEY` secret** — Edge Function gets an empty string, creates a client with no privileges, all DB writes fail.

### RLS Policy Model

- All tables have **public SELECT** (dashboard reads without auth).
- All **writes are blocked** for anonymous/authenticated roles (migrations `20260307000001` and `20260307192410` dropped the permissive write policies).
- Writes only succeed when made by the service role client inside the Edge Function.
- Exception: `submissions` table retains public INSERT for the `/submit` form (handled by `submit-app` Edge Function).

### Data Flow

```
Dashboard        → supabase client (anon key) → SELECT only, real-time subscriptions
/submit form     → submit-app Edge Function   → INSERT into submissions
/admin actions   → admin-mutations Edge Function (JWT-authenticated) → service role writes
```

### Key Files

- `src/lib/adminApi.ts` — thin wrapper that attaches the session JWT and POSTs to the Edge Function
- `src/lib/errorMessages.ts` — maps Supabase/Postgres error codes to human-readable messages
- `src/types/hackathon.ts` — shared TypeScript types (Participant, Activity, Topic)
- `src/integrations/supabase/client.ts` — Supabase client (URL + publishable key hardcoded as fallbacks)
- `supabase/functions/admin-mutations/index.ts` — single switch-based handler for all admin operations
- `supabase/functions/submit-app/` — public form submission handler

### Supabase Project

Project ID: `fhyuvjznkaklefkxvgse`
The URL and publishable key are hardcoded as fallbacks in `client.ts` and `adminApi.ts`, so `.env` is optional for development.
