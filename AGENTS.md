# Prompting Guidelines for Codex Tasks (Starter – New Projects)

## Guardrails

* **No Hardcoding:** Never hardcode colors, API keys, or paths. Use tokens, environment variables, or existing helpers.
* **Scope Control:** Only edit files/directories explicitly listed in the task.
* **Consistency:** Follow existing patterns, naming conventions, and component structures.

## Tool Preambles

Always begin by:

1. Restating the user’s goal in one sentence.
2. Listing the files/functions you will touch (keep it short).
3. After changes, summarize what was changed (paths + line counts).

## Reasoning Effort

* **Low effort:** Quick fixes, one-line imports, or minor style changes.
* **Medium effort (default):** Multi-file tasks or moderate features.
* **High effort:** Large features, complex debugging, or migrations.

## Persistence

* Keep going until the task is complete, unless instructed otherwise.
* If uncertain, pick the most reasonable assumption, act on it, and note it at the end.

## Style & Standards

* Match the codebase’s standards (imports, file structure, comments).
* Keep files under **300 LOC**; split components if larger.
* Use **globals.css tokens** for colors/spacing/borders. If missing, add tokens rather than hardcoding.

## Component Wrappers & Imports (Layering Rules)

* **Always check `components/common`** (or the designated “common” folder) **for an existing wrapper** before creating or importing anything new.
* **Do not import third-party UI primitives directly in pages or features.** Use the project’s **wrapper components** instead.
* If a wrapper doesn’t exist, **create a small wrapper in `components/common`** and use that—rather than importing the library component directly.
* Apply this to common UI needs (notifications/toasts, cards, buttons, inputs, tabs, etc.) **without naming specific third-party components** here.
* Use the **Heading** component for headings.
* **Enforcement rule:** Never import from `@/components/ui/*` outside of `components/common/*` or the `components/ui/*` layer itself.

## Wording & Copy Preservation

* **Preserve exact user-visible wording** (titles, labels, button text, help text, descriptions) from provided specs, mockups, or existing screens.
* **Do not paraphrase or “improve”** copy unless explicitly instructed.
* When extracting to components, **pass existing strings via props unchanged**.

## Reset Line (for new chats)

```
Context reset: This is a new project setup. Follow the project’s layering rules:
pages/features → components/common (wrappers) → components/ui (base primitives).
Do not import from @/components/ui/* outside the common/ui layers.
```
