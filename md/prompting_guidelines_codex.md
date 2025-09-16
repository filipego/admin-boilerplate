# Prompting Guidelines for New Projects (Boilerplate)

These notes keep refactors and new builds consistent with the SITB
boilerplate.

## Core Rules

-   **Do not duplicate components.** Always reuse from
    `/components/common` before writing new.
-   **Do not import Shadcn directly** in pages; always use wrapped
    components from `/components/common`.
-   **Respect globals.css tokens** (`--background`, `--foreground`,
    `--card`, etc.); never hardcode colors.
-   **Check migrations:** Supabase migrations must live in
    `/supabase/migrations`. Do not touch DB logic outside migration
    files.
-   **Notes system:** Reuse existing view/edit flows for notes. Do not
    create parallel systems.

## Project Startup

When creating a new feature/project: 1. Scan `/components/common` for
existing building blocks. 2. Follow directory structure:
`/src     /app       → routes + layouts     /components/common → UI wrappers     /lib       → utilities     /stores    → Zustand     /supabase  → client + migrations     /styles    → globals.css`
3. Use `create-sitb-admin-app` CLI scaffolding where available.

## File Boundaries

-   Keep files \<300 LOC. If longer, split into subcomponents in the
    same folder.
-   Avoid renames or cross-folder moves unless explicitly requested.
-   Only edit files listed in the task.

## Tool Preambles

Always begin by: - Restating the task in one sentence. - Listing target
files to be edited. - After changes, summarize what was done (paths +
line counts).

## Reasoning Effort

-   **Low:** One-liners, import fixes, style tweaks.
-   **Medium (default):** Small feature adds, component reuse,
    migrations.
-   **High:** Multi-file refactors, new subsystems.

## Reset Line

    Context reset: Work inside the boilerplate structure. 
    Reuse existing components. Do not hardcode styles. 
    Do not modify APIs or Supabase logic unless explicitly told.