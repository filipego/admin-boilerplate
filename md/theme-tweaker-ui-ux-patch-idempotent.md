# ThemeTweaker — Sidebar Focus & Selection UX Patch (Idempotent)

> **Goal:** Reduce overwhelm from 200–300+ tokens and ensure smooth “click‑to‑select” editing.  
> **Constraint:** **Idempotent** changes — before creating anything, **detect whether it already exists** and update/extend instead of duplicating.

---

## 0) Global Idempotency Rules
When implementing any step below:
1. **Probe first**, then act.
2. Prefer **extend/patch** over “create new”.
3. **No duplicates**: if the symbol/file/route/component already exists, **update in place**.
4. If multiple candidates are found, ask the user to confirm which one to use.

Use these kinds of checks (adapt to the project):
- **Components**: search for file exports by name and JSX usage before generating a new file.
- **Routes**: check router config or existing page files.
- **Store/State**: look for an existing Zustand slice or context key before adding new keys.
- **CSS tokens**: check if the token name already exists (both `:root` and `.dark`).

---

## A) Sidebar Token Navigation (don’t recreate if present)

### A1. Accordion Grouping
**Check:** If the sidebar already groups tokens (accordion or sections).  
**If not, add** a grouping layer with the following order/names (adjust to local naming):
- **Core surfaces**: `--background`, `--foreground`, `--card`, `--card-foreground`
- **Brand palette**: `--brand-1 … --brand-6`
- **Semantic**: `--primary`, `--secondary`, `--accent`, `--destructive`, `--success`, `--warning` (+ `-foreground` variants)
- **Controls & chrome**: `--border`, `--input`, `--ring`, `--radius`, `--shadow-card`, `--elev1`, `--elev2`
- **Custom/Other**: everything else (A–Z)

**Idempotent behavior:** If any of these sections already exist, **reuse** them; only add missing ones.

### A2. Filters (chip row)
**Check:** If a filter row exists.  
**If missing, add** chips/toggles:
- **Scope**: All / **Changed** / **Recent** / **Favorites**
- **Edit Scope**: Global / Class override / Instance
- **Theme**: Light / Dark / Both
- **Impact**: *Used by selected component*

**Idempotent behavior:** If some filters already exist, add **only** the missing ones.

### A3. Search/Typeahead
**Check:** If search is present.  
**If missing, add** fuzzy search by token name/description with match highlighting and count.

### A4. Focus Mode (contextual filtering)
**Check:** If selecting a component narrows token list.  
**If missing, implement**:
- When a component is selected, auto‑filter to tokens **used by that component**, then show **related** tokens.
- Provide “Show all tokens” toggle to exit Focus Mode.

### A5. Virtualized List
**Check:** If list virtualization is enabled for large lists.  
**If missing, add** virtualization when token count > 200 (threshold configurable).

### A6. Favorites & Changed
**Check:** If tokens can be starred and filtered.  
**If missing, add** ⭐ pin per token; add “Favorites” & “Changed” filters. Persist favorites in existing state/presets if available.

---

## B) Click‑to‑Select (confirm and extend if partial)

### B1. Dev Flag & Data Attributes
**Check:** Feature flag and dev attributes.
- Confirm a feature flag gates ThemeTweaker (e.g., `NEXT_PUBLIC_THEMETWEAKER=1`).
- Confirm universal wrappers render `data-ui` (and `data-variant`, `data-size` where relevant) **only when the flag is on**.

**If missing:** Add gated attributes to wrappers. **Do not** add them to production builds.

### B2. Selection Mode Toggle
**Check:** Is there a toggle like “Select on page”?  
**If missing, add** a toggle in the panel header or inspector.

### B3. Capture‑phase Click Handler & Overlay
**Check:** Is there a capture‑phase listener that highlights the **nearest `data-ui` ancestor**?
- Prevent default navigation **only while in selection mode**.
- Draw a highlight overlay via portal with a high z-index.

**If missing or partial,** add/complete this behavior. **Do not** select inner tags (no deep div selection).

### B4. Store Update & Sidebar Reaction
**Check:** On selection, does the store receive `{ componentName, variant, size, domPath }` and does the UI switch to the *Component* tab?  
**If missing,** wire it. Also enable **Focus Mode** (A4) when a component is selected.

---

## C) Token Row UX (augment in place)

**Check:** Existing token row fields.  
**Ensure** each row provides (add only what’s missing):
- Token name & swatch (for colors) or type badge (radius/shadow/etc.).
- Inline light/dark values with a small theme toggle.
- ⭐ Favorite toggle.
- 🛈 Details popover showing description, usage, and affected components.
- **Apply scope** radio: Global / Class override / Instance (default to last used).
- Inline **Undo** for that token (revert preview for the current session).

---

## D) Defaults & Thresholds (non‑intrusive)

- Collapse all groups **by default** except those relevant to the current selection.
- If tokens > 200, **enable virtualization** and keep **search visible** by default.
- If changed tokens > 12, show a sticky “Review N changes” button that switches to the Diff tab.

**Check first** whether similar behaviors already exist; only add missing pieces or tune thresholds.

---

## E) Layout Tab (extend, don’t replace)

**Check:** If a Layout tab exists.  
**If missing, add** minimal controls:
- **Page background**: color/image, cover/contain/center.
- **Radius/Shadow presets**: Subtle / Carded / Floating / Flat → map to radius/shadow token bundles.

If the tab exists, **augment** with these controls only if they’re missing.

---

## F) Acceptance Checklist (Idempotent)
- [ ] Implementations re‑use existing components/routes/state **when present**; no duplicates are created.
- [ ] Selecting a component narrows the token list (Focus Mode) with a “Show all tokens” exit.
- [ ] Accordion groups + filters + search reduce visual load; list is virtualized for large sets.
- [ ] Favorites and Changed filters work; favorites persist in current preset/state system.
- [ ] Click‑to‑select only picks top‑level `data-ui` elements; overlay renders correctly; navigation unaffected outside selection mode.
- [ ] Changes blend into current design (reusing universal wrappers); tool compiles cleanly.

---

## G) Notes
- Keep the current visual style by **reusing universal wrapper components**; do not import Radix directly unless wrappers are missing.
- All preview changes must go through the existing **runtime style injector** (single `<style id="tt-runtime">`), preserving no‑re‑render behavior.
- Respect existing keyboard shortcuts and theme toggles if they exist; otherwise, add them sparingly.
