# ThemeTweaker — Fallback Structure Sketch (Hint Only)

> **Purpose:** Give Cursor/Trae a clean default scaffold **for the tool itself** while still adapting to whatever structure your repo already uses. This is **not** your admin’s structure. The tool should still **scan** the repo to discover tokens, wrapper components, and where to patch.

---

## Reuse Existing UI
- **Import and reuse** your **universal wrapper components** (wrapping shadcn) for the tool’s own UI (Button, Input, Card, Tabs, Select, Slider, Dialog, etc.).
- Do **not** rebuild basic inputs from scratch unless something is missing.
- During dev mode, ensure wrappers render **`data-ui="<ComponentName>"`** and **`data-variant`** attributes so the tool can support **click‑to‑edit** selection.

---

## Feature Flag Gating
- The entire tool must be gated behind a **feature flag** (e.g., `NEXT_PUBLIC_THEMETWEAKER=1`).
- Only when the flag is on:
  - Mount the **floating action button (FAB)**.
  - Enable **click‑to‑edit** capture and highlight overlay.
  - Render `data-ui` attributes in wrappers.

---

## Suggested Folder Tree (adjust as needed)
```
<repo-root>/features/theme-tweaker/
  ToolProvider.tsx            # feature flag check, contexts, portals
  ToolFab.tsx                 # floating action button (open/close panel)

  ToolPanel.tsx               # right-side panel shell (Tabs: Tokens | Component | Layout | Diff)
  ToolInspector.tsx           # header area: selected component, theme toggle, impact panel
  ToolComponentPicker.tsx     # search + dropdown to pick components/pages

  controls/                   # reuse your wrappers inside these controls
    ToolColorInput.tsx
    ToolNumberInput.tsx
    ToolToggle.tsx
    ToolShadowEditor.tsx
    ToolBorderEditor.tsx
    ToolSpacingEditor.tsx
    ToolVariantSelector.tsx

  runtime/
    applyRuntime.ts           # manages <style id="tt-runtime">, preview classes, token updates
    selectionOverlay.ts       # highlight box + click capture (top-level `data-ui` only)

  analysis/
    repoScan.ts               # discover token file(s), overrides file, wrapper locations
    tokenExtractor.ts         # parse light/dark variables
    componentAnalyzer.ts      # map wrappers -> tokens/variants/classes (ts-morph)
    themeMapCache.ts          # read/write theme-map.json

  store/
    useThemeTweakerStore.ts   # Zustand store: selected node, theme, edits, undo/redo

  io/
    diffPlan.ts               # aggregate changes for modal
    savePatches.ts            # write patches safely, confirm paths
    codemods/
      applyClassToUsage.ts    # add class to nearest JSX usage (instance-only scope)
      ensureOverridesImport.ts# insert overrides import after tokens
      updateTokenValues.ts    # minimal-diff token replacement (preserve formatting)
```

> ✅ **Note:** This folder lives **outside** your admin component tree to keep it removable. Adjust root path if your repo uses `src/` or a monorepo `packages/*` layout.

---

## Minimal Integration Points
1. **FAB Mount**: Mount `ToolFab` globally when the feature flag is on (e.g., in your root layout or app shell). Ensure its container uses a **portal** with a high z-index.
2. **Dev Attributes**: Update your universal wrapper components to render `data-ui` / `data-variant` **only when the flag is on**. No other changes required.
3. **Selection Mode**: `selectionOverlay` attaches a capture-phase listener; selects the **nearest** `data-ui` ancestor; prevents navigation in selection mode only.
4. **Theme Sync**: Mirror the app’s current theme (light/dark); allow manual toggle for preview in the panel.

---

## Branding Variables (6-slot palette)
Add/confirm brand tokens exist in your global token source (the tool will **discover the correct file** at runtime; path is **not hardcoded**). Example values are placeholders:

```css
:root {
  --brand-1: oklch(65% 0.15 25);
  --brand-2: oklch(70% 0.12 120);
  --brand-3: oklch(68% 0.14 260);
  --brand-4: oklch(72% 0.10 40);
  --brand-5: oklch(60% 0.16 330);
  --brand-6: oklch(55% 0.12 200);

  /* Optional semantic remaps */
  --primary: var(--brand-1);
  --secondary: var(--brand-2);
  --accent: var(--brand-3);
}

.dark {
  --brand-1: oklch(78% 0.10 25);
  --brand-2: oklch(80% 0.09 120);
  --brand-3: oklch(82% 0.09 260);
  --brand-4: oklch(75% 0.08 40);
  --brand-5: oklch(70% 0.10 330);
  --brand-6: oklch(74% 0.08 200);
}
```

---

## Save Flow (path‑agnostic)
- Show **Diff** tab with token changes, new/updated classes, and codemod insertions.
- Use **repoScan** results to write patches to the **confirmed** files:
  - Token values → global token source (both `:root` and `.dark`).
  - Class overrides → a dedicated **overrides stylesheet**, imported **after** tokens.
  - Instance‑only → add chosen class to JSX usage (codemod + snippet confirmation).
- Commit on new branch `chore/theme-tweaker-YYYYMMDD`; provide **revert** helper.

---

## Acceptance Checks (quick)
- Feature appears **only** with the flag on.
- Click‑to‑edit selects **top‑level** `data-ui` component (not inner tags).
- Live tweaks apply via `<style id="tt-runtime">` without re-render.
- Tokens patch correctly, overrides import is ensured, codemod applies class to usage.
- Tool compiles and can be **deleted** without breaking the app.
