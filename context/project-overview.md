# Admin Boilerplate

## Overview

Admin Boilerplate is a reusable Studio In The Box starter for building authenticated dashboards, admin panels, and internal tools. It provides a Next.js application shell, Supabase-backed profile and permission scaffolding, a wrapper-based UI system, file upload patterns, dashboard examples, and an optional runtime Theme Tweaker for styling exploration.

## Goals

1. Provide a fast starting point for dashboard and admin applications.
2. Keep UI implementation consistent through shared wrappers in `src/components/common`.
3. Centralize theme decisions in `src/app/globals.css` tokens instead of hardcoded styles.
4. Preserve clear boundaries between routes, shared components, base UI primitives, feature modules, and Supabase infrastructure.
5. Support incremental client-specific customization without creating parallel systems.

## Core User Flow

1. A user reaches the app through `/login` or an authenticated dashboard route.
2. Existing Supabase auth signs the user in and ensures a profile row exists.
3. Authenticated users see the persistent app shell with Sidebar and Header.
4. Users navigate through dashboard, examples, users, reports, and profile sections.
5. Admin-oriented areas use profile roles and permissions where implemented.
6. Optional upload and avatar flows store media through Supabase Storage or Cloudflare R2 endpoints, depending on the route.

## Features

### App Shell

- Auth-aware Root Layout that renders Sidebar and Header only for signed-in users.
- Sidebar navigation configured in `src/components/layout/sidebar.config.ts`.
- Theme provider and toaster setup in the shared provider layer.

### UI Toolkit

- Base primitives live in `src/components/ui`.
- Project wrappers live in `src/components/common`.
- Common wrappers include buttons, cards, modals, confirmations, tabs, data tables, status badges, charts, date pickers, upload helpers, and loading/error states.
- `Heading` is the required heading abstraction for new UI.

### Auth, Profiles, and Permissions

- Current Supabase login exists and should remain untouched until the planned Supabase rewrite.
- Profiles, roles, role permissions, storage policies, and related RLS live in `supabase/migrations`.
- Supabase clients are centralized in `src/lib/supabase`.

### Theme Tweaker

- `features/theme-tweaker` contains a feature-flagged runtime styling tool.
- Enable with `NEXT_PUBLIC_THEMETWEAKER=1`.
- Runtime edits and save logic are scoped to the feature module and the `theme-tweaker` API route.

### Uploads and Media

- Supabase Storage is used for avatars in the existing database/storage setup.
- Cloudflare R2 upload routes exist for generic file uploads and avatar uploads.
- Image domains are allowlisted in `next.config.ts`.

## Scope

### In Scope

- Dashboard and admin app scaffolding.
- Shared UI wrappers and layout patterns.
- Theme tokens and reusable styling conventions.
- Supabase migration files and helper clients as current infrastructure.
- Documentation that helps agents and developers work safely in this boilerplate.

### Out of Scope

- Rewriting Supabase login/auth flows until explicitly requested.
- Large refactors of existing oversized files unless directly assigned.
- Replacing the UI primitive layer.
- Moving unrelated feature code while working on a targeted task.
- Creating parallel component, auth, notification, or routing systems.

## Success Criteria

1. A future agent can identify the stack, boundaries, and project rules before editing code.
2. New pages and features reuse `src/components/common` wrappers instead of importing base primitives directly.
3. Visual changes use `src/app/globals.css` tokens or existing helpers rather than hardcoded colors.
4. Supabase-related work is scoped to migrations, centralized clients, server actions, or route handlers.
5. Documentation stays synchronized when architecture, scope, standards, or meaningful implementation state changes.
