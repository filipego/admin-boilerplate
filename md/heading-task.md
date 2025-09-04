# Heading Component Alignment Task

- Owner: Codex CLI assistant
- Date: 2025-09-04

## Goals
- Align `Heading` component to match the project’s existing typography and utility patterns (disregarding Theme Tweaker).
- Replace hard-coded heading tags in components with the shared `Heading` component for consistency.
- Document the work for tracking.

## Style Analysis (current usage)
- Page titles: `h1` with `text-xl font-semibold` and optional `leading-tight` / `tracking-tight`.
- Section headings: `h3` with `text-sm font-medium` (+ spacing when needed).
- Card titles: typically default font size (base) with `font-semibold`; sometimes `CardTitle` with `text-base`.
- Project uses the `cn` utility for class merging; no custom font-family classes in headings.

## `Heading` Component Update
- File: `src/components/common/Heading.tsx`
- Changes:
  - Switched to `cn` utility (to match project pattern).
  - Simplified props and size scale to mirror existing usage.
  - Size mapping:
    - `2xl`: `text-3xl font-semibold`
    - `xl`: `text-2xl font-semibold`
    - `lg` (default): `text-xl font-semibold`
    - `md`: `text-base font-semibold`
    - `sm`: `text-sm font-medium`
    - `xs`: `text-xs font-medium`
  - `as` prop preserved for semantic tag selection.

## Replacements Performed (components + pages)
- Updated to use `Heading` and preserved context-specific classes (e.g., spacing/leading). Also enforced no `h1` usage (first page heading now `h2`).
  - `src/components/common/PageHeader.tsx:16` → `<Heading as="h2" size="lg" className="leading-tight">`
  - `src/components/layout/MainContent.tsx:10` → `<Heading as="h2" size="lg" className="tracking-tight mb-4">`
  - `src/components/common/Stepper.tsx:28` → `<Heading as="h3" size="sm">`
  - `src/components/common/SettingsLayout.tsx:96` → `<Heading as="h3" size="sm" className="mb-2">`
  - `src/components/common/UICard.tsx:72,77` → `<Heading as="h3" size="md" className="leading-tight ...">`
  - `src/app/examples/page.tsx: Navigation, Editor, Details, Quick Form, SidePanel` → `<Heading as="h3" size="sm">` for each section label

## Enforce No H1
- Updated prior `as="h1"` usages to `as="h2"`:
  - `src/components/common/PageHeader.tsx:16` → `<Heading as="h2" ...>`
  - `src/components/layout/MainContent.tsx:10` → `<Heading as="h2" ...>`

## Exclusions
- Theme Tweaker (intentionally ignored): `features/theme-tweaker/*`.
- Pages (e.g., `src/app/examples/page.tsx`) are left as-is unless requested.

## Next Suggestions
- Optionally migrate page-level headings in `src/app/*` to use `Heading`.
- If desired, add a `variant` prop later (e.g., `page`, `section`) that presets size + weight + tracking.
- Consider ESLint rule or codemod to prevent raw `<h*>` usage in components.

## Examples Added
- `src/app/examples/page.tsx`: Inserted a "Headings" card near the top showcasing:
  - Level variants (h2–h6) using `Heading`.
  - Size scale examples (`2xl` → `xs`).

## Notes
- All changes are non-breaking in usage sites; `className` is preserved where needed for spacing/leading.
- No changes made to `CardTitle` since it’s not a native heading and follows its own UI pattern.
