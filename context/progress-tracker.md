# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Documentation restructure in progress on branch `dev`.

## Current Goal

- Replace the old root `AGENTS.md` with a context-driven structure based on `Docs to replace`, while preserving the real admin boilerplate stack, rules, and current project state.

## Completed

- Scanned the project structure, package configuration, root guidance, template guidance, and key app boundaries.
- Created root `context` documentation files for project overview, architecture, UI context, code standards, AI workflow rules, and progress tracking.
- Replaced root `AGENTS.md` with a short context index and reset line.

## In Progress

- No implementation feature work is currently in progress.

## Next Up

- Review the new context files for wording and project accuracy.
- Decide whether to keep or remove `Docs to replace` after confirming the migration is complete.
- Later, plan the dedicated Supabase login/auth rewrite using Supabase-specific guidance.

## Open Questions

- Should `Docs to replace` remain in the repository as a reference template, or be removed after this migration?
- Should existing direct imports from `@/components/ui/*` outside common/ui layers be refactored in a separate cleanup task?
- Should existing files over 300 LOC be split in a separate technical debt pass?

## Architecture Decisions

- Root `AGENTS.md` is now an index into project context files rather than a long rules document.
- Project-specific rules were moved into focused context files instead of copying placeholder template content.
- Existing Supabase login is documented as current-state infrastructure and explicitly out of scope for this documentation pass.

## Known Technical Debt

- Several existing files exceed the 300 LOC guideline, especially in `features/theme-tweaker` and `src/app/examples/page.tsx`.
- Some existing pages, layout files, and feature files import directly from `@/components/ui/*`, which conflicts with the desired layering rule for new work.
- Theme Tweaker contains existing hardcoded color values in its specialized tool surface.

## Session Notes

- Branch: `dev`.
- Existing untracked files before this documentation pass included `.cursor/commands/` and `Docs to replace/`.
- Supabase login rewrite is intentionally deferred.
