# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Dependency upgrade pass completed on branch `dev`.

## Current Goal

- Upgrade the boilerplate to Next.js 16 and apply low-risk dependency updates without changing app behavior.

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

## In Progress

- No implementation feature work is currently in progress.

## Next Up

- Review the new context files for wording and project accuracy.
- Later, plan the dedicated Supabase login/auth rewrite using Supabase-specific guidance.
- Consider a separate cleanup pass for lint warnings surfaced by the Next 16 ESLint config.
- Consider separate impact checks for deferred major dependency upgrades.

## Open Questions

- Should existing direct imports from `@/components/ui/*` outside common/ui layers be refactored in a separate cleanup task?
- Should existing files over 300 LOC be split in a separate technical debt pass?
- Should deferred major package upgrades be handled before or after the Supabase auth rewrite?

## Architecture Decisions

- Root `AGENTS.md` is now an index into project context files rather than a long rules document.
- Project-specific rules were moved into focused context files instead of copying placeholder template content.
- Existing Supabase login is documented as current-state infrastructure and explicitly out of scope for this documentation pass.
- Next.js 16 is now the framework baseline.
- shadcn UI primitives now use the unified `radix-ui` package instead of individual Radix package imports.
- Supabase packages were not upgraded in this pass because the login/auth flow is intentionally deferred for a dedicated Supabase rewrite.
- Major package upgrades with higher behavior risk were deferred: `lucide-react` 1.x, `react-day-picker` 10.x, `sonner` 2.x, `tailwind-variants` 3.x, `eslint` 10.x, `typescript` 6.x, and `vitest` 4.x.

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
