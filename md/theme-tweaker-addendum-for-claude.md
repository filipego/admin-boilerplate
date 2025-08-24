# ThemeTweaker — Addendum & Corrections for Claude 4

This note aligns Claude's **Technical Architecture Document** with the latest product constraints and our repo‑agnostic approach.

---

## 1) Versions & Dependencies
- **Do not lock versions** (e.g., “React@19 / Next@15 / Zustand@5”). Use project defaults and peer constraints. Declare ranges in `package.json` only if missing.
- **UI components:** Prefer our **universal wrapper components** (which wrap shadcn). Use Radix primitives **only through** those wrappers; do not import Radix directly in the tool unless a wrapper is unavailable.

---

## 2) Repo‑Agnostic Scanning (No Hardcoded Paths)
- The tool must **discover** token files, wrapper locations, and override styles via a **repo scan**.
- If multiple candidates are found, **prompt the user** to confirm the correct files.
- Cache results to `theme-map.json` at the tool root. Include a manual‑edit fallback.

**Do not assume** `src/app/globals.css` or `src/components/ui/button.tsx` exist.

---

## 3) API Routes vs. Local FS
Claude proposed `/api/theme-tweaker/*` routes. That’s fine **only if** the project already uses Next API routes and local FS access is allowed during dev.

- If API routes are not desired, implement a **local Node utility** (invoked by the tool in dev) to perform scan/save/diff operations.
- **Security:** The save/patch logic must only run in **dev mode** and behind the **feature flag**.

**Feature flag requirement:** `NEXT_PUBLIC_THEMETWEAKER=1` (or equivalent).

---

## 4) Click‑to‑Edit Scope
- Only select the **top‑level component** (identified by `data-ui="<ComponentName>"`).
- Do **not** allow selection of inner tags (no deep div selection).
- Add `data-variant` and `data-size` where applicable **in dev mode only**.

---

## 5) Branding Tokens (6‑slot palette)
Add six brand tokens **alongside** shadcn tokens and allow remapping:
```
--brand-1 ... --brand-6
```
- Define light/dark values (OKLCH preferred).
- Allow optional semantic remap:
  - `--primary: var(--brand-1)`
  - `--secondary: var(--brand-2)`
  - `--accent: var(--brand-3)`

**Derive dark values** when only light is provided (increase L ~8–15; reduce C ~10–20%).

---

## 6) Runtime CSS Engine
- Maintain a single `<style id="tt-runtime">` for **non‑destructive preview**:
  - Token edits → update `:root`/`.dark` variable values in the style tag.
  - Class overrides → generate a preview class and apply to the selected element.
  - Instance‑only → same as class override at runtime; persist via codemod on Save.

No full component re‑render.

---

## 7) Save/Diff Pipeline (Path‑agnostic)
- **Diff modal** before writing: show token changes, overrides, and instance codemods.
- **Token patcher:** replace values only; preserve formatting and comments.
- **Overrides file:** if absent, create one and import **after** tokens (ask user to confirm import location).
- **Instance codemod:** add the chosen class to the nearest JSX usage (show snippet for approval).
- Commit on a new branch `chore/theme-tweaker-YYYYMMDD`. Provide a revert helper.

---

## 8) Minimal “Fallback” Folder Sketch (Hint Only)
Use this **only** as a scaffold for the tool; adjust to repo norms.
```
features/theme-tweaker/
  ToolProvider.tsx
  ToolFab.tsx
  ToolPanel.tsx
  ToolInspector.tsx
  ToolComponentPicker.tsx
  controls/
    ToolColorInput.tsx
    ToolNumberInput.tsx
    ToolToggle.tsx
    ToolShadowEditor.tsx
    ToolBorderEditor.tsx
    ToolSpacingEditor.tsx
    ToolVariantSelector.tsx
  runtime/
    applyRuntime.ts
    selectionOverlay.ts
  analysis/
    repoScan.ts
    tokenExtractor.ts
    componentAnalyzer.ts
    themeMapCache.ts
  store/
    useThemeTweakerStore.ts
  io/
    diffPlan.ts
    savePatches.ts
    codemods/
      applyClassToUsage.ts
      ensureOverridesImport.ts
      updateTokenValues.ts
```

---

## 9) Acceptance Checklist (Delta vs Claude Doc)
- [ ] Feature flag fully gates UI, dev attributes, and any FS/API actions.
- [ ] Repo scan has **no hardcoded paths** and prompts for ambiguity.
- [ ] Click‑to‑edit selects only **top‑level** `data-ui` nodes.
- [ ] 6 brand tokens exist (light/dark), with optional semantic remaps.
- [ ] Runtime previews via a **single** `<style id="tt-runtime">`.
- [ ] Save pipeline shows diffs and writes minimal patches; instance codemod works.
- [ ] All code compiles even if the feature folder is removed.
