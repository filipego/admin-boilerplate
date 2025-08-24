# Write the revised spec without CLI mentions or hardcoded file paths

content = """# ThemeTweaker — Dev‑only visual theming tool (Spec for Trae/Cursor)

> **Goal:** Add a lightweight, removable **visual theming UI** that lets me (a) live‑tune global tokens and component styles, (b) preview instantly without full re‑render, and (c) **export** changes back to the repo (tokens + optional class/instance overrides) with both light/dark values.  
> **Constraints:** Next.js + Tailwind v4; use **CSS variables + Tailwind utilities only** (no hard‑coded CSS). Keep it **dev‑only** and **zero‑cost** (no paid APIs).  
> **Do not assume file paths.** The tool must **scan the repo** to discover where tokens and styles live and operate accordingly.

---

## High‑level approach

1. **Isolation & naming**
   - Implement as an internal feature named **ThemeTweaker**.
   - **Prefix all tool components with `Tool`** (e.g., `ToolPanel`, `ToolColorInput`) to avoid collisions.
   - Do **not** modify existing universal components directly during live editing; work via runtime styles and optional codemods only on **Save**.
   - Provide a **floating FAB** to open/close the panel without affecting page layout (fixed bottom‑right).

2. **Dev gating**
   - Expose the feature **only when a feature flag/environment switch is set** (e.g., `NEXT_PUBLIC_THEMETWEAKER=1`).
   - Ensure all dev‑only attributes (like `data-ui`) and listeners are **gated** behind this flag.

3. **Selection model (click‑to‑edit)**
   - When active, a capture‑phase click handler highlights the **nearest element with `data-ui="<ComponentName>"`** and selects it.
   - Universal wrapper components should render `data-ui` / `data-variant` **in dev mode only**.
   - **Do not drill** into inner tags; selection is the top‑level component container.

4. **Live application (no re‑render)**
   - Maintain a single injected `<style id="tt-runtime">` tag.
   - On control changes:
     - **Global scope:** update CSS variables for the active theme (light/dark) in the runtime style tag.
     - **Class override:** generate a temporary preview class and attach it to the selected DOM element.
     - **Instance only:** same as class override at runtime; only persisted on Save via codemod.
   - Tool UI mirrors current app theme (light/dark) and can toggle for preview.

5. **Scanning & mapping (no hardcoded paths)**
   - On first run, **scan the repository** to discover:
     - The **global token source** (root CSS where variables are defined for light and dark).
     - Where **component wrappers** live (the “universal components” that wrap shadcn).
     - Where **global overrides** (if any) are applied/imported.
   - Build a cache file (e.g., `theme-map.json`) describing:
     - Tokens (names + values for light/dark).
     - Which components use which tokens/classes/variants.
     - Known pages/routes (optional, for page‑level background controls).
   - If multiple candidates exist, **prompt the user** to pick the correct files.

6. **Save/export (repo‑aware, path‑agnostic)**
   - On Save, present a **diff modal** listing pending changes.
   - Persist changes using **file patches** against the discovered files:
     - **Token updates:** replace only variable values (keep formatting/comments); write to the discovered token source for **:root** and **.dark**.
     - **Class overrides:** create/update a **dedicated overrides stylesheet** (if none exists, create one and ensure it’s imported **after** tokens). Keep path selection user‑approved.
     - **Instance only:** run a **codemod** that adds the chosen class to the selected JSX usage.
   - Write all changes on a new branch `chore/theme-tweaker-YYYYMMDD`. Provide an automatic **revert** option.

---

## Controls (per component)

For each detected universal component (e.g., Button, Input, Card, Badge, Tabs, Navbar, Sidebar, Modal), expose:

- **Colors:** background, foreground, border, ring (token‑linked with option to set custom).
- **Variants:** map to existing variant props/classes (e.g., default/outline/ghost/link).
- **Border radius:** global token linkage by default with optional per‑corner override.
- **Border width & sides:** on/off per side + width slider.
- **Shadow:** on/off + choose from existing elevation tokens.
- **Spacing:** padding (x/y) and optional margin.
- **Opacity & transitions:** simple sliders.
- **Layout backgrounds:** color or image URL with cover/contain/center toggles.
- **Apply scope:** radio group → **Global token** / **Class override** / **This instance only**.

**Impact panel:** when editing a token, show “Affects: [component list]”.

---

## Analyzer details (path‑agnostic)

Implement static analysis **locally**:

- **Token extraction**
  - Parse the discovered global token file(s) for variable definitions in both **light (`:root`)** and **dark (`.dark`)** scopes.
  - Build a dictionary `{ tokenName: { light: value, dark: value } }` and track line ranges for precise patching.

- **Component scan**
  - Use TypeScript AST tools (e.g., `ts-morph`) to inspect wrapper components for:
    - `className` strings with Tailwind utilities and any `var(--...)` usages.
    - Inline `style` props using CSS variables.
    - Presence of `data-ui`, `data-variant`, `data-size` hints (dev‑only).
  - Map `ComponentName -> { tokensUsed, variants, sizes, localClasses }`.

- **Cache**
  - Persist findings to `theme-map.json`. Allow a **manual mapping** file if some items can’t be auto‑detected.

---

## Branding palette (add ~6 brand variables)

Introduce a small neutral‑to‑vivid **brand palette** that exists alongside shadcn tokens. Keep brand tokens **independent** to enable remapping.

**Recommended variables (light & dark values):**
