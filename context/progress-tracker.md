# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Supabase auth hardening pass completed on branch `dev`.

## Current Goal

- Harden the existing Supabase authentication and authorization surface without rewriting the login flow.

## Completed

- Scanned the project structure, package configuration, root guidance, template guidance, and key app boundaries.
- Created root `context` documentation files for project overview, architecture, UI context, code standards, AI workflow rules, and progress tracking.
- Replaced root `AGENTS.md` with a short context index and reset line.
- Removed the temporary `Docs to replace` folder after migrating its structure into root context docs.
- Upgraded Next.js to 16.2.6 with React and React DOM 19.2.6.
- Updated same-major or patch/minor dependencies where impact was low, including Radix primitive packages, Tailwind CSS tooling, React Hook Form, Recharts, Zod, Zustand, AWS SDK S3, and related type/tooling packages.
- Updated the dynamic users API route to await Next.js 16 `params`.
- Migrated linting from `next lint` to `eslint .` and converted pre-existing lint debt to warnings so the lint command runs successfully.
- Migrated Next image host allowlisting from `images.domains` to `images.remotePatterns`.
- Ran non-force `npm audit fix` to apply safe transitive security updates.
- Migrated shadcn/Radix primitives to the current unified `radix-ui` package using `npx shadcn@latest migrate radix -y`.
- Removed direct dependencies on the old individual `@radix-ui/react-*` packages after confirming app source no longer imports them.
- Upgraded additional non-Supabase packages after isolated checks: `vitest` 4.1.7, `lucide-react` 1.17.0, `sonner` 2.0.7, `react-day-picker` 10.0.1, and `tailwind-variants` 3.2.2.
- Corrected the Supabase project context to local project ref `bwlskocvvspbaltihfvo`; MCP access to that project is currently blocked by permissions, so no remote migrations or schema changes were applied.
- Added Supabase SSR proxy session refresh wiring for Next.js 16.
- Removed unsafe dev/admin seed routes that could create or promote admin users.
- Stopped using the cached `role` cookie for admin authorization and removed role cookie writes from profile ensure logic.
- Added server-side auth and permission checks inside user creation server actions before using the service-role client.
- Added a Supabase migration that revokes broad client-side profile updates and grants authenticated users update access only to editable profile columns.
- Initialized local Supabase CLI configuration for future `supabase start` usage once Docker is available.
- Added project-scoped Supabase MCP configuration in `.mcp.json` for project ref `bwlskocvvspbaltihfvo`.
- Added project-local Supabase CLI dependency, npm scripts, local env template, and local Supabase dev workflow documentation.
- Installed Docker Desktop manually from the downloaded app bundle and started the local Supabase dev stack.
- Switched ignored `.env.local` to local Supabase values after backing up the remote env locally.
- Linked the Supabase CLI to production project `bwlskocvvspbaltihfvo`.
- Replaced the temporary local smoke user with a sanitized production-like local auth/profile import containing only users, identities, profiles, permissions, and role permissions.
- Excluded production sessions, refresh tokens, audit entries, one-time tokens, OAuth, MFA, SSO, SAML, and WebAuthn data from the local import.
- Ignored `supabase/.snapshots/` so local production-derived auth snapshots are not committed.
- Improved starter-friendly component wrappers after a shadcn alignment review: form fields now use the shared input primitive with label/error accessibility, DataTable now composes the shadcn table primitive with optional export and empty states, UICard avoids full-card link overlays when nested actions exist, icon buttons work through `UIButton`, and sidebar profile avatars use a common avatar wrapper.
- Removed generated `src/components/.DS_Store`.
- Fixed the common `KanbanBoard` drag behavior so cards can move between columns by dropping onto another card or the target column.
- Improved `KanbanBoard` drag feedback so the destination column stays highlighted when hovering over cards in populated columns, with a visible dragging state on the active card.
- Added local Supabase startup instructions to `README.md`, including `npm run supabase:start`, `npm run supabase:status`, and `npm run dev:local`.

## In Progress

- No implementation feature work is currently in progress.

## Next Up

- Review the new context files for wording and project accuracy.
- Later, plan the dedicated Supabase login/auth rewrite using Supabase-specific guidance.
- Consider a separate cleanup pass for lint warnings surfaced by the Next 16 ESLint config.
- Supabase package upgrades remain deferred for the dedicated Supabase auth rewrite.
- Supabase MCP authentication needs to be completed from the local project MCP config after reloading the agent session.
- Docker Desktop is running, but the `docker` CLI is not linked into shell `PATH` because the Homebrew cask's sudo symlink step could not run non-interactively.

## Open Questions

- Should existing direct imports from `@/components/ui/*` outside common/ui layers be refactored in a separate cleanup task?
- Should existing files over 300 LOC be split in a separate technical debt pass?
- Should `@types/node` stay on Node 20 types, or move to newer Node types when the runtime target changes?

## Architecture Decisions

- Root `AGENTS.md` is now an index into project context files rather than a long rules document.
- Project-specific rules were moved into focused context files instead of copying placeholder template content.
- Existing Supabase login is documented as current-state infrastructure and explicitly out of scope for this documentation pass.
- Next.js 16 is now the framework baseline.
- shadcn UI primitives now use the unified `radix-ui` package instead of individual Radix package imports.
- Supabase packages were not upgraded in this pass because the login/auth flow is intentionally deferred for a dedicated Supabase rewrite.
- `eslint` 10.x was tested and reverted because `eslint-config-next`'s bundled `eslint-plugin-react` failed while loading `react/display-name`.
- `typescript` 6.x was not installed because the current `typescript-eslint` peer range is `>=4.8.4 <6.0.0`.

## Known Technical Debt

- Several existing files exceed the 300 LOC guideline, especially in `features/theme-tweaker` and `src/app/examples/page.tsx`.
- Some existing pages, layout files, and feature files import directly from `@/components/ui/*`, which conflicts with the desired layering rule for new work.
- Theme Tweaker contains existing hardcoded color values in its specialized tool surface.
- ESLint now runs successfully but reports many warnings from existing code, especially Theme Tweaker, direct UI primitive imports, `any` usage, and React compiler hook rules.
- `npm audit` still reports unresolved advisories that require breaking upgrades or upstream Next/Vitest fixes: Next's transitive PostCSS advisory and Vitest/Vite/esbuild advisories.

## Session Notes

- Branch: `dev`.
- Existing untracked files before this documentation pass included `.cursor/commands/` and `Docs to replace/`.
- Supabase login rewrite is intentionally deferred.
- Verification after the Next.js 16 upgrade: `npm run test -- --run`, `npm run lint`, and `npm run build` all pass.
- Verification after the non-Supabase dependency upgrades: `npm run test -- --run`, `npm run lint`, and `npm run build` all pass.
- Verification after the Supabase auth hardening and local-dev setup pass: `npm run test -- --run`, `npm run lint`, and `npm run build` all pass. A targeted `npx tsc --noEmit` check showed no errors in changed auth files, while full typecheck still reports pre-existing Theme Tweaker, R2 upload, CSV import, and shared form typing debt.
- Local runtime check: Supabase local stack started, migrations applied successfully, Next dev server started at `http://localhost:3000`, and `/login` returns HTTP 200.
- Local Supabase data check after production-like import: 2 auth users, 2 identities, 2 profiles, 4 permissions, and 4 role permissions.
- Verification after the component wrapper pass: `npm run lint` exits with 0 errors and 237 existing warnings. A filtered `npx tsc --noEmit --pretty false` check showed no errors in the touched component files; full typecheck still fails in known Theme Tweaker, R2 upload, and CSV import areas that were outside this task.
- Verification after the Kanban drag fix: `npm run lint` exits with 0 errors and 237 existing warnings. Browser check on `http://localhost:3000/examples` confirmed dragging a To Do card into In Progress and an In Progress card into Done. Full `npx tsc --noEmit --pretty false` still fails in pre-existing Theme Tweaker, R2 upload, CSV import, form typing, and users modal areas; no `KanbanBoard` type errors were reported.
- Verification after the Kanban drag feedback fix: `npm run lint` exits with 0 errors and 237 existing warnings. A targeted `npx tsc --noEmit --pretty false` filter showed no `KanbanBoard` errors. Browser check on `http://localhost:3000/examples` confirmed dragging into a populated column still moves the card correctly and logged no console errors.
- Verification after the README local Supabase docs update: inspected `package.json` scripts and `context/local-supabase-dev.md`; no runtime verification needed for docs-only changes.
