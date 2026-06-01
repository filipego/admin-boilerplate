# Code Standards

## General

- Keep changes scoped to the files and directories named or implied by the task.
- Match existing imports, naming, component structure, and route organization.
- Fix the root cause rather than layering workaround code.
- Do not create parallel systems for concerns already represented in the boilerplate.
- Preserve exact user-visible wording from specs, mockups, or existing screens.
- Keep new files under 300 LOC. Split components before they grow beyond that.
- Avoid unrelated renames, moves, formatting churn, or broad refactors.

## TypeScript

- The project uses strict TypeScript.
- Prefer explicit interfaces or inferred local types over `any`.
- Validate unknown external input at API and server-action boundaries.
- Keep server-only values out of client components.
- Use path aliases from `tsconfig.json`: `@/*` for `src/*` and `@/features/*` for `features/*`.

## Next.js

- Use App Router conventions in `src/app`.
- Default to Server Components unless client interactivity requires `"use client"`.
- Keep route handlers focused on one responsibility.
- Use server actions for form mutations when they match existing local patterns.
- Keep app shell behavior centralized in `src/app/layout.tsx` and layout components.
- Do not add navigation arrays inside pages; use `src/components/layout/sidebar.config.ts`.

## Styling

- Use `src/app/globals.css` tokens and Tailwind token classes.
- Do not hardcode colors, spacing, borders, shadows, radii, or paths in new app UI.
- If a needed token is missing, add or extend tokens instead of hardcoding values.
- Use `cn` from `@/lib/utils` for class composition.
- Use `Heading` for headings.
- Keep text fitted to its parent across mobile and desktop layouts.

## Component Layering

- Always check `src/components/common` before creating or importing a UI component.
- Pages and feature modules must not import from `@/components/ui/*`.
- Base primitives may be imported by `src/components/common/*` and `src/components/ui/*`.
- If no common wrapper exists, create a small wrapper in `src/components/common` and use that.
- This applies to buttons, cards, dialogs, alerts, tabs, tables, inputs, selects, sheets, popovers, tooltips, badges, avatars, and similar UI.

## API Routes and Server Logic

- Validate and parse request input before business logic.
- Enforce auth and permissions before mutations.
- Use Supabase helpers from `src/lib/supabase`.
- Use `getSupabaseAdminClient` only in server-only code that truly needs elevated access.
- Use `checkOrigin` and `rateLimit` from `src/lib/utils.ts` where appropriate for mutation or upload routes.
- Return predictable response shapes and status codes.

## Data and Storage

- Database and RLS changes belong in ordered SQL files under `supabase/migrations`.
- Do not bypass RLS casually. Prefer policies, RPCs, or server handlers designed for elevated access.
- Metadata belongs in Supabase tables.
- Files and large media belong in Supabase Storage or configured R2 endpoints.
- Do not store service role keys or private credentials in client-accessible code.

## Notifications, Confirmations, and Copy

- Use `src/lib/toast.ts` for toast helpers.
- Use `src/lib/messages.ts` for reusable confirmation and shared text.
- Use `UIConfirm` for confirmation dialogs.
- Do not inline duplicate notification or confirmation patterns in pages.

## File Organization

- `src/app/` - routes, layouts, pages, route handlers, server actions.
- `src/components/common/` - reusable app-facing UI wrappers and components.
- `src/components/ui/` - low-level primitives only.
- `src/components/layout/` - app shell and navigation.
- `src/components/providers/` - cross-cutting providers.
- `src/components/auth/` - permission and auth render helpers.
- `src/lib/` - reusable utility and service helpers.
- `src/store/` - global Zustand stores.
- `features/<feature>/` - feature modules with local components, stores, utils, runtime code, and feature-specific common wrappers where already established.
- `supabase/migrations/` - database and storage schema source of truth.
- `tests/` - Vitest tests.
