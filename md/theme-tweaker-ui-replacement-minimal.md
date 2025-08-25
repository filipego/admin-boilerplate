# ThemeTweaker — UI Replacement (Simple Only)

**Scope:** Replace the existing styling controls with a single, simple interface. No additional modes, no extra options. Keep everything else exactly as it is.

---

## Color
- Two inputs per color token: **Light** and **Dark**.
- **Input format:** accepts pasted HEX (e.g., from Figma). `#RGB`, `#RRGGBB` (also allow rgb()/hsl() if already supported).
- **Behavior:** on paste, update preview immediately; on save, **convert to OKLCH** internally and write to the token store exactly where it already writes today (use the repo’s existing token format; OKLCH preferred if allowed).
- **UI elements:** text field + swatch preview for current vs pending.

## Radius
- **Single slider** (0–32 px, step 1) with a visible value.
- Updates preview as the slider moves; save writes the numeric value to the same place it already writes today.

## Border
- **Width slider** (0–8 px, step 1).
- **Side toggles:** Top / Right / Bottom / Left.
- **Style select:** solid / dashed / dotted.
- Live preview; save writes to the same target as current implementation.

## Shadows
- **Layered sliders** (up to 3 layers total):
  - X (−40..40), Y (−40..40), Blur (0..80), Spread (−20..40), Opacity (0–100%).
  - **Color input:** HEX only (convert to OKLCH on save).
- Add/Remove layers; reorder if supported already.
- Live preview; save maps to the same shadow token/class currently used.

## Spacing
- **Padding X / Y sliders** (0–48 px, step 1) with quick value chips (e.g., 0, 4, 8, 12, 16, 24).
- Live preview; save writes using the same mechanism as today.

---

## Interaction Rules (unchanged plumbing)
- Any edit updates the existing preview immediately (no re-renders).
- Light vs Dark are edited explicitly—no auto-derivation between them.
- Saving produces the same diff/patch flow you already have.

---

## Acceptance
- Pasting a HEX color updates preview instantly; saving persists it (converted to OKLCH) to the same token target as before.
- Radius/Border/Shadows/Spacing are controlled **only** by sliders/toggles and behave as described above.
- No additional modes or advanced fields are present anywhere in this UI.
