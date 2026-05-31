## Application Building Context

Read the following files in order before implementing
or making any architectural decision:

1. `context/project-overview.md` - product definition,
   goals, features, scope, and current out-of-scope work
2. `context/architecture.md` - system structure,
   boundaries, storage model, auth model, and invariants
3. `context/ui-context.md` - theme, tokens, typography,
   component wrappers, layout, and icon conventions
4. `context/code-standards.md` - implementation rules,
   TypeScript, Next.js, styling, API, and file organization
5. `context/ai-workflow-rules.md` - development workflow,
   scoping rules, protected files, and delivery approach
6. `context/progress-tracker.md` - current phase,
   completed work, known technical debt, and next steps

Update `context/progress-tracker.md` after each
meaningful implementation change.

If implementation changes the architecture, scope, UI
system, or standards documented in the context files,
update the relevant file before continuing.

Context reset: Work inside the admin boilerplate structure.
Follow the layering rules:
pages/features -> components/common wrappers -> components/ui primitives.
Do not import from `@/components/ui/*` outside the common/ui layers.
