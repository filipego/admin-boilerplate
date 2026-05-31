# AI Workflow Rules

## Approach

Build this boilerplate incrementally and conservatively. Read the context files before implementing, preserve established patterns, and keep documentation synchronized with meaningful implementation changes. The current Supabase login should be treated as existing infrastructure and left alone until a task explicitly asks for the planned Supabase rewrite.

## Tool Preambles

Always begin by:

1. Restating the user's goal in one sentence.
2. Listing the files or functions you will touch.
3. After changes, summarizing what changed with paths and line counts.

## Reasoning Effort

- **Low effort**: quick fixes, one-line imports, or minor style changes.
- **Medium effort**: default for multi-file tasks, moderate features, docs updates, or component composition.
- **High effort**: large features, complex debugging, migrations, auth rewrites, or cross-boundary refactors.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Only edit files and directories explicitly listed in the task or required by the documented context.
- Do not combine unrelated UI, API, auth, database, and documentation changes in a single implementation step.
- If uncertain, choose the most reasonable assumption, act on it, and note it at the end.

## When to Split Work

Split an implementation step if it combines:

- UI changes and database/auth changes.
- Multiple unrelated API routes.
- Component system changes and feature behavior changes.
- Refactors of existing technical debt with new product behavior.
- Supabase login/security changes with unrelated dashboard work.

If a change cannot be verified end to end quickly, the scope is too broad.

## Handling Missing Requirements

- Do not invent product behavior not defined by the task or context files.
- If a requirement is ambiguous, document the assumption in `context/progress-tracker.md`.
- If a requirement is missing and cannot be resolved safely, add it as an open question before continuing.
- Preserve existing user-visible copy unless the task explicitly asks for copy changes.

## Protected Files and Areas

Do not modify the following unless explicitly instructed:

- `src/components/ui/*`, except when intentionally adding or adjusting base primitives.
- `supabase/migrations/*`, except for database or storage tasks.
- Supabase login/auth flow files, until the dedicated rewrite task.
- Existing Theme Tweaker internals, unless the task is about theme tweaking.
- Generated or framework artifacts such as `.next`, `node_modules`, and build info files.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or folder boundaries.
- Auth, permissions, database, storage, or environment-variable assumptions.
- UI wrapper rules, tokens, or layout conventions.
- Code standards or workflow rules.
- Current progress, known technical debt, open questions, or next steps.

Update `context/progress-tracker.md` after each meaningful implementation change.

## Before Moving to the Next Unit

1. The current unit works within its defined scope.
2. No invariant in `context/architecture.md` was violated.
3. `context/progress-tracker.md` reflects meaningful completed work.
4. Relevant docs were updated before continuing.
5. Verification was run when practical, or the reason it was skipped is documented.
