---
description: For ANY selected component, show the actual token variables it already uses (light/dark) on the existing component card. When a user-defined class is present, enable inputs that override the SAME token names locally (or set the direct property if not token-driven). No new variables. No new panels.
globs: src/**/*.{tsx,ts,css}
alwaysApply: false
---
# Per‑Component Token View + Scoped Overrides (No New Vars)

## Placement
- **Use the existing component card** (the one shown when an element is selected). Append a section titled **“Token usage & overrides”** at the bottom.
- **Do not** create any new panels.

## Selection binding (ALL components)
- Read the **currently selected element** from the same store the highlighter uses (e.g., `useThemeTweakerStore().selectedNode`).
- On selection change, recompute token bindings for that element. **No hardcoded component names.**

## What to display (read‑only by default)
For the selected component, display rows for these properties:
- `color`
- `background-color`
- `border-color`
- `outline-color`
- `box-shadow`
- `--radius`
- `--ring`

For each row, show:
- **Token name actually used** (e.g., `--foreground`, `--background`, `--border`, `--ring`, etc.) if driven by `var(...)`.
- **Light value** (resolved under `:root`) and **Dark value** (resolved under `.dark`).
- Values must be shown as **hex / rgba** (preserve alpha as `rgba(...)`), never LAB/OKLCH in the UI.

If a value is **not** driven by a token (no `var(...)` in the cascade), label it **Hardcoded** and enqueue it into the existing codemod queue.

## Override trigger (user‑defined class only)
- **Do not** auto-create classes.
- Treat any **non‑utility** class on the component root as the **override trigger** (e.g., `.button-alt`, `.my-card`).
- Ignore Tailwind utilities using a filter like:
  ```
  /^(bg-|text-|border-|ring-|p-|m-|w-|h-|flex|grid|gap-|justify-|items-|hover:|focus:|dark:|sm:|md:|lg:|xl:)/
  ```

## When an override class exists
Enable inputs that **override exactly what’s displayed**:
- If the row is token‑driven (e.g., `background-color → var(--background)`), then **override the same token name locally** inside the class by re‑declaring it:
  ```css
  .YOUR-CLASS { --background: <new color>; }
  ```
  (This changes only this component subtree; global tokens remain untouched.)

- If the row is **not token‑driven** (e.g., `box-shadow` computed from a literal), then write the **direct CSS property** locally in the class:
  ```css
  .YOUR-CLASS { box-shadow: <new shadow>; }
  ```

- Use the exact same input components as the **Tokens** tab (color pickers and sliders). No new UI components.

### Inputs to expose (Figma/Framer‑style behavior)
- **Colors:** for any token‑driven `color`, `background-color`, `border-color`, `outline-color` → color input updates the **local re‑declaration of that token** in the class.
- **Radius:** if `--radius` is used → slider updates `--radius` **inside the class**.
- **Ring:** if `--ring` is used → color input updates `--ring` **inside the class**.
- **Shadows:** show X, Y, Blur, Spread, and Color inputs; compose `box-shadow` and set it **directly** in the class (only if the row is not token‑driven). If a shadow token is used (e.g., `var(--shadow)`), re‑declare **that same token** inside the class.
- **Padding / Margin / Gap (optional):** if already present on the element and surfaced by the card, expose numeric inputs and set them **directly** in the class (do not invent new variables).

### Live preview & persistence
- **Preview** by injecting a runtime stylesheet **only for the selected element’s class** (scoped). Do not write to files.
- **Persist** by showing a **copyable CSS block** with the local overrides (the class and the properties/token re‑declarations). The developer pastes this into `globals.css` manually.
- **Never** edit global tokens from this card.

## Token resolution rules
- Resolve token name by tracing the final computed style → back to `var(--token)` if present.
- Resolve Light value under `:root`, and Dark value under `.dark`.
- If multiple variables chain (e.g., `var(--sidebar, var(--background))`), display the **first defined** token name that applies, plus the resolved values for both modes.

## Codemod (separate from overrides)
- Continue to detect and enqueue **Hardcoded** instances for replacement with existing tokens via your codemod pipeline. No changes here.

## Acceptance criteria
- Selecting **any component** updates the existing card with the rows above, showing **the actual token names used** + **Light/Dark values**.
- When a **user‑defined non‑utility class** is present on the root, inputs unlock and:
  - Re‑declare the **same tokens** locally in the class for token‑driven rows, or
  - Set the **direct CSS property** locally in the class for non‑token rows.
- Live preview works; a **copyable CSS** block is provided; **no global tokens** are modified.
- No new UI panels or variable names are introduced.
