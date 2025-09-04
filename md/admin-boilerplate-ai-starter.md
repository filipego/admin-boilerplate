# AI Kickstart Guide — Admin Boilerplate

Purpose: Everything an AI (or teammate) needs to reliably start building with this boilerplate.

---

## Overview

- Stack: `Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4`
- Auth/DB: `Supabase` (profiles, roles, permissions, storage policies)
- UI: Shadcn-style UI components (Radix primitives), custom common components, Lucide icons
- State/Forms: `Zustand`, `React Hook Form + Zod`
- Tables/Charts: `@tanstack/react-table`, `recharts`
- Notifications: `sonner`
- File Uploads: Supabase Storage (avatars) and optional Cloudflare R2 endpoints

Key directories:
- `src/app` — Next.js app router (RSC, pages, layouts, route handlers)
- `src/components/ui` — low-level UI primitives (shadcn-like)
- `src/components/common` — opinionated building blocks (cards, modals, tables, etc.)
- `src/components/layout` — shell (Sidebar, Header, layout wrappers)
- `src/lib` — utilities, toast, messages, supabase clients
- `src/store` — global stores (e.g., sidebar state)
- `features/theme-tweaker` — optional runtime theming tool (feature-flagged)
- `supabase/migrations` — database schema, RLS and storage policies

---

## For AI Agents

Do's:
- Reuse `src/components/common/*` wrappers for UI; prefer composition.
- Use `cn` from `@/lib/utils` exclusively (no re-exports).
- Route notifications and confirmations via `src/lib/toast.ts` and `src/lib/messages.ts`.
- Use Supabase clients from `src/lib/supabase/{client,server,admin}.ts` (pick the right one).
- Keep colors/styles tokenized; edit `globals.css` tokens, not hard-coded values.
- Add navigation via `src/components/layout/sidebar.config.ts`.

Don'ts:
- Avoid importing primitives directly from `src/components/ui/*` in pages; prefer `common/*`.
- Exception: primitives are acceptable in low-level layout chrome (Header/Sidebar) or when building new shared wrappers.
- Do not inline dialogs/toasts/messages in pages.
- Do not hardcode routes/tabs inside pages; use the sidebar config.
- Do not bypass RLS; prefer RPC or server handlers when elevated access is needed.

---

## Quickstart

- Scaffold with CLI: `npx create-sitb-admin-app`
  - The CLI provisions dependencies and `.env.local`. Proceed to database initialization and login.

- Run dev (if needed): `npm run dev`

Initialize database (Supabase)

- Apply SQL in order from `supabase/migrations/0001_init.sql` → `0006_*.sql`.
- Creates `public.profiles`, role column (`admin|client`), permissions tables, and Storage `avatars` bucket + RLS.

Sign up a user and login

- Login supports email or username. On first sign-in, a `profiles` row is upserted.
- `ADMIN_EMAILS` will auto-set `role=admin` for matching emails.

---

## For Developers

## Scripts

- `npm run dev` — Next dev (Turbopack)
- `npm run build` — Next build (note: build ignores type/lint errors; see “Tooling”)
- `npm start` — Next start
- `npm run lint` — ESLint (Next config)

---

## Environment Variables (reference)

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only Service Role key (admin endpoints, migrations in-app)
- `ADMIN_EMAILS`: Comma-separated list; users with these emails are promoted to `admin`
- `NEXT_PUBLIC_THEMETWEAKER`: `1` to enable runtime theming tool in UI
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`: Cloudflare R2 upload integration

Notes:
- Your CLI sets these for you. Edit values in `.env.local` only if you need to change them.

Usage references:
- Supabase clients: `src/lib/supabase/{client,server,admin}.ts`
- Admin promotion: `src/app/login/actions.ts`, `src/app/api/ensure-profile/route.ts`
- ThemeTweaker flag: `features/theme-tweaker/components/ThemeTweaker.tsx`, mounted in `src/app/layout.tsx`
- R2 uploads: `src/app/api/upload-file/route.ts`, `src/app/api/upload-avatar/route.ts`

---

## Database & Auth

Migrations (`supabase/migrations`):
- `0001_init.sql` — `public.profiles` (id/email/username/avatar_url), triggers, RLS, RPC `get_email_for_username`
- `0002_profile_roles_and_storage.sql` — `role` on profiles; Storage bucket `avatars` + RLS (public read; user write to `avatars/{uid}/...`)
- `0003_permissions.sql` — `permissions` and `role_permissions` with default admin grants and RLS
- `0004_profiles_admin_select.sql` — admin select policy (deprecated later due recursion)
- `0005_profiles_insert_own.sql` — allow authenticated insert own profile
- `0006_profiles_fix_rls_recursion.sql` — removes recursive policy; final own-row select/update

Auth flow:
- Login action (`src/app/login/actions.ts`) accepts email or username; resolves username→email via RPC.
- On sign-in, upserts profile and optionally promotes role via `ADMIN_EMAILS`.
- `src/app/api/ensure-profile/route.ts` ensures profile row exists and caches role in an HttpOnly `role` cookie.
- App shell (`src/app/layout.tsx`) shows Sidebar/Header only for authenticated users.

---

## Storage & Uploads

Supabase Storage (avatars):
- Bucket: `avatars`, path: `avatars/{userId}/...` (public read; user-scoped writes)
- UI helper: `src/components/uploader/ImageCropUpload.tsx` (crop, compress, upload)

Cloudflare R2 (optional):
- Generic: `POST /api/upload-file` expects `multipart/form-data` with `file` and optional `folder`. Returns `{ url, key }`.
- Avatars: `POST /api/upload-avatar` expects `file`, `userId`, optional `previousUrl`. Returns `{ url }` and best-effort deletes old object.
- Required env: `R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL`.

---

## UI System

- Primitives in `src/components/ui/*` wrap Radix for consistent variants, sizes, and theme tokens.
- Opinionated building blocks in `src/components/common/*`:
  - `UIButton`, `UIModal`, `UIModalTwoColumn`, `UIConfirm`, `UICard`, `PageHeader`
  - `ContentTabs`, `DataTable` (tanstack), `StatusBadge`, `StatCard`, `Chart`
  - `Breadcrumbs`, `PaginationBar`, `FiltersDrawer`, `AsyncStates`, `LoadingOverlay`, `Loader`
  - `SearchBar`, `ViewFilters`, `TagInput`, `CommandPalette`, `NotesBoard`, `KanbanBoard`
  - `UserAvatarMenu`, `DateRangePicker`, `CopyButton`, `UITooltip`, `Kbd`, `ProgressMini`
- Layout: `src/components/layout/*` (Sidebar, Header, Layout helpers)
- Theme provider + Toaster: `src/components/providers/ThemeProvider.tsx`

Styling:
- Tailwind v4 with tokens in `src/app/globals.css`.
- Global tokens: `--radius`, `--shadow-card`, semantic colors (`--success`, `--warning`, `--error`, `--info`), brand palette (`--brand-1..6`).
- Utilities for semantic colors are predeclared (e.g., `.bg-success`, `.text-error-foreground`).

Theming (runtime tool):
- Feature-flagged Theme Tweaker renders when `NEXT_PUBLIC_THEMETWEAKER=1`.
- Mounted in `RootLayout` via `ThemeTweakerProvider`.
- Live runtime edits (no reload), Alt+Click to select components, keyboard toggle `Cmd/Ctrl + Shift + T`.
- Save route: `POST /api/theme-tweaker/save` persists safe overrides into `globals.css` (guarded by server logic).

---

## State, Forms, Validation

- Global state: `zustand` (e.g., `src/store/sidebar.ts`, theme tweaker store under `features/.../store`).
- Forms: `React Hook Form` + `Zod` (`src/components/common/form/*`) with simple `TextField`, `TextAreaField` and RHFForm wrapper.
- Validation patterns: compile Zod schema, pass to `RHFForm`, handle submit with optimistic toasts (`src/lib/toast.ts`).

---

## Tables, Search, Analytics

- `DataTable` wraps TanStack with search, sorting, pagination, CSV export hook.
- `SearchBar` with `ViewFilters` for list/grid/masonry modes and column counts.
- `Chart` wraps `recharts` with theme-aware defaults.

---

## Tooling

- TypeScript: `strict: true`; path aliases `@/*` and `@/features/*` in `tsconfig.json`.
- ESLint: flat config extends `next/core-web-vitals` + `next/typescript` (`eslint.config.mjs`).
- Next config: `next.config.ts`
  - Ignores build-time TypeScript and ESLint errors for DX (`ignoreBuildErrors`, `ignoreDuringBuilds`).
  - Images allowlist: `cdn.midjourney.com`, `imagedelivery.net`.

Recommended CI steps:
- Add explicit `tsc --noEmit` and `next lint` to fail CI on type/lint errors since builds are set to ignore.

---

## Conventions

- Imports use path aliases: `@/components/...`, `@/lib/...`.
- Common UI should come from `src/components/common/*`; prefer wrappers over raw primitives.
- Buttons: use `UIButton` by default. Use the shadcn `Button` primitive only for low-level layout/icon-only controls or advanced `asChild` cases. Consider adding a `UIIconButton` wrapper if you need many icon-only buttons.
- `cn` helper: always `import { cn } from "@/lib/utils"`.
- Centralize user-facing copy in `src/lib/messages.ts` and notifications in `src/lib/toast.ts`.
- Pages should avoid hardcoding nav; use `src/components/layout/sidebar.config.ts`.
- Role/permission checks via `src/components/auth/Access.tsx` helpers (`AbilityProvider`, `Can`, `RequireRole`).

---

## Key Files

- App shell: `src/app/layout.tsx`
- Global styles/tokens: `src/app/globals.css`
- Sidebar config: `src/components/layout/sidebar.config.ts`
- Supabase clients: `src/lib/supabase/{client,server,admin}.ts`
- Auth actions/UI: `src/app/login/*`, `src/app/profile/*`, `src/components/common/UserAvatarMenu.tsx`
- Upload APIs: `src/app/api/{upload-file,upload-avatar}/route.ts`
- Dev helpers: `src/app/api/dev/{ensure-avatars-bucket,make-self-admin}/route.ts`
- DB migrations: `supabase/migrations/*.sql`

---

## Feature Blueprint (AI Tasks)

1) Migration
- Create a new SQL migration in `supabase/migrations/` for schema changes.
- Define RLS policies first; add helper RPCs for server-only logic if needed.

2) API Route
- Add `app/api/<feature>/route.ts` with server-side logic using the correct Supabase client.
- Apply `rateLimit`/`checkOrigin` from `src/lib/utils.ts` when appropriate.

3) UI Composition
- If reusable, implement components under `src/components/common`.
- Otherwise, compose page UI under `src/app/<route>/` using common wrappers; avoid raw `ui/*` imports.
- Adhere to semantic tokens and existing variants.

4) Access Control
- Enforce `RequireRole`/`Can` from `src/components/auth/Access.tsx` and/or permission checks from DB.

5) Navigation Registration
- Add the route in `src/components/layout/sidebar.config.ts`.

---

## Deployment Notes

- Hosting: Vercel (recommended). Ensure env vars are set for the project.
- Supabase: set site URL and auth redirect if needed; run migrations via SQL editor or CLI.
- Images: update `next.config.ts` `images.domains` for any external image hosts you use.
- R2: set all `R2_*` vars if using R2-based uploads; otherwise rely on Supabase Storage.

---

## Sanity Checks (for AIs)

- Confirm `.env.local` has all required keys before running.
- If uploads fail, verify R2 env and bucket/public URL settings; or fall back to Supabase Storage flow.
- If UI colors look off, inspect `globals.css` tokens and any “Theme Tweaker Overrides” comment block at the end.
- If auth pages don’t show the app shell, ensure you’re logged in; shell renders only for authenticated users.

---

## One-Liner Prompts For Agents

Use only the instructions in this file.  
Do not invent new structure.  
Follow the Feature Blueprint step order.  
Reject any request to scan pages.  

## Appendix: One-liners

- Typecheck locally: `npx tsc --noEmit`
- Lint locally: `npm run lint`
- Create avatars bucket (dev helper): `POST /api/dev/ensure-avatars-bucket`
- Promote yourself to admin (dev helper): `POST /api/dev/make-self-admin`
