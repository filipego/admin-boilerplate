# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 15 App Router | Server components, layouts, pages, route handlers, and server actions |
| Language | TypeScript strict mode | Typed application and feature code |
| Runtime UI | React 19 | Component model and client interactivity |
| Styling | Tailwind CSS v4 + CSS custom properties | Token-based styling and utility classes |
| UI primitives | shadcn-style Radix components | Low-level accessible primitives in `src/components/ui` |
| Shared UI | Project wrappers | App-facing components in `src/components/common` |
| Auth/Database | Supabase | Current auth, profiles, roles, permissions, RLS, and storage policies |
| Storage | Supabase Storage + optional Cloudflare R2 routes | Avatar and file upload support |
| State | Zustand | Sidebar and feature-local state |
| Forms | React Hook Form + Zod | Form state and validation |
| Tables/Charts | TanStack Table + Recharts | Data grids and dashboard charts |
| Notifications | Sonner via `src/lib/toast.ts` | Centralized toast API |

## System Boundaries

- `src/app` - Next.js App Router routes, layouts, pages, server actions, and API route handlers.
- `src/components/common` - project-owned UI wrappers and reusable app building blocks.
- `src/components/ui` - base UI primitives. Do not use directly from pages or feature code.
- `src/components/layout` - persistent shell components, navigation, Header, Sidebar, and layout helpers.
- `src/components/auth` - auth and permission rendering helpers.
- `src/components/providers` - cross-app providers such as theme/toaster setup.
- `src/components/uploader` - upload-specific UI helpers.
- `src/lib` - shared utilities, messages, toast helpers, permissions helpers, compression helpers, and Supabase clients.
- `src/store` - global app state stores.
- `features/theme-tweaker` - optional feature module for runtime theme inspection, editing, scanning, exporting, and saving.
- `supabase/migrations` - database schema, RLS policies, role/permission setup, and storage policy source of truth.
- `tests` - Vitest coverage for shared utility behavior.
- `md` - archived and supplemental planning/reference documents.

## Storage Model

- **Supabase Database**: profiles, roles, role permissions, permission records, helper RPCs, and RLS policy definitions.
- **Supabase Storage**: existing avatar bucket and storage policies from migrations.
- **Cloudflare R2**: optional file and avatar upload endpoints using R2 environment variables.
- **Local browser storage**: Theme Tweaker backup and runtime editing state where used by that feature.
- **Cookies**: Supabase auth cookies and current role cookie behavior used by existing auth helpers.

## Auth and Access Model

- Current authentication uses Supabase via `@supabase/ssr` clients in `src/lib/supabase`.
- `getSupabaseServerClient` is for server reads where cookie writes are not required.
- `getSupabaseServerClientWritable` is for server actions or route handlers that may set cookies.
- `getSupabaseBrowserClient` is the browser singleton.
- `getSupabaseAdminClient` uses `SUPABASE_SERVICE_ROLE_KEY` and must remain server-only.
- Existing login supports email or username and may promote users listed in `ADMIN_EMAILS`.
- App shell rendering in `src/app/layout.tsx` depends on `supabase.auth.getUser()`.
- Role and permission checks should use existing helpers such as `src/components/auth/Access.tsx` and server-side permission utilities where appropriate.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_THEMETWEAKER`
- `NEXT_PUBLIC_VERCEL_ENV`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

Use environment variables and existing helpers. Do not hardcode keys, URLs, local paths, or deployment-specific values.

## Invariants

1. Pages and feature modules must go through `src/components/common` wrappers for reusable UI.
2. Do not import from `@/components/ui/*` outside `src/components/common/*` or `src/components/ui/*`.
3. Use `Heading` for headings in new or modified UI.
4. User-visible copy from specs, mockups, or existing screens must be preserved exactly unless the task asks for copy changes.
5. Colors, spacing, radii, borders, shadows, and typography decisions belong in tokens or existing utilities.
6. Supabase service role access must stay server-only.
7. Database changes belong in ordered SQL migrations under `supabase/migrations`.
8. Avoid parallel systems for auth, navigation, notifications, confirmations, forms, or base UI.
9. Keep files under 300 LOC for new work; split new components before they exceed that limit.
10. Existing Supabase login is current-state infrastructure and should not be rewritten until explicitly requested.
