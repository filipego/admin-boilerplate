### Theme Tweaker: Color Picker, Any-Format Input → OKLCH, and UI Cleanup

#### Goals
- Add a modern color picker that opens when clicking the color icon to the right of each color input.
- Accept any valid CSS color string (hex, rgb(), rgba(), hsl(), hsla(), lch(), lab(), oklch(), oklab(), named colors like "red", etc.) and normalize/store as OKLCH.
- Remove the extraneous `lab(...)` (or similar) lines shown next to labels in the UI.

#### Scope
- Only Theme Tweaker UI and its internal color handling.
- No breaking changes to existing tokens schema; internal canonical format remains OKLCH.
- Keep styling in Tailwind, integrate with shadcn UI primitives.

#### Component Architecture
- Create a universal, reusable color input/picker component in `features/theme-tweaker/components/common/`:
  - `UniversalColorInput.tsx` (name tentative):
    - Props: `valueOKLCH`, `onChangeOKLCH`, `label`, `helpText?`, `disabled?`, `id?`, `aria-*`, `gamut?`.
    - UI parts:
      - Text input for free-form color strings (accepts any CSS color).
      - Right-side icon button that opens a popover with the color picker.
      - Optional alpha control.
      - Optional preview swatch.
    - Responsibilities:
      - Parse user-entered strings to OKLCH (with validation and helpful errors).
      - Convert picker selection to OKLCH and invoke `onChangeOKLCH`.
      - Manage display format (show canonical or last-entered input) while keeping OKLCH as source of truth.
  - Use in all places where Theme Tweaker currently shows color inputs.

#### Library Choices
- Color parsing/conversion: prefer `colorjs.io` (robust CSS Color Level 4 support, including OKLCH/OKLAB). Alternative: `culori`.
- Color picker UI:
  - shadcn does not include a color picker component by default. Plan: use [`react-colorful`](https://github.com/omgovich/react-colorful) for a modern, lightweight, good-looking picker embedded inside shadcn `Popover` and styled with Tailwind to match.
  - If a shadcn color picker becomes available later, we can swap implementations behind the universal component.

#### UX/Behavior
- Clicking the color icon opens a popover with the picker. Selecting a color updates the input and OKLCH value immediately (live preview).
- The text input accepts any CSS color; on blur or Enter, parse → convert → store as OKLCH. Invalid values show an inline error and do not change stored state.
- Alpha is respected. Represent as `oklch(L C H / A)`.
- Gamut handling strategy (configurable; default: gamut-map to sRGB):
  - Attempt conversion to OKLCH and back to sRGB for preview; if out-of-gamut, gamut-map.
  - Provide a tooltip indicating gamut mapping occurred if relevant.

#### Validation & Error States
- On parse failure: show a brief error below the field and keep prior valid value.
- On success: clear error, update OKLCH and preview.
- Debounce parsing for typing; strict parse on blur/Enter.

#### Accessibility
- Inputs and icon button have `aria-label`, `aria-controls`, `aria-expanded` (for popover), and `tabIndex`.
- Keyboard: Enter to commit, Esc to close popover, arrow keys/tab to navigate controls.
- Contrast-aware preview outline where relevant.

#### Data Flow
1. Source of truth: OKLCH object/value in parent state (Theme Tweaker store remains canonical OKLCH).
2. Display value: last user-entered string if valid, otherwise formatted OKLCH or hex fallback for readability.
3. Picker → OKLCH directly via color library.
4. Text input → parse string → normalize → OKLCH.

#### Removal of `lab(...)` Lines
- Remove the debug/secondary color-space readouts being rendered next to labels (e.g., `lab(100% 0 0)`, `lab(5.58% 19.84 -41.62)`):
  - Identify the components that render these readouts (likely in Theme Tweaker controls or token rows).
  - Remove the JSX for these extra lines. If still useful during development, guard behind a `DEBUG_THEME_TWEAKER` env flag and keep disabled by default.

#### Pseudocode (High-level)
```tsx
// UniversalColorInput.tsx
const UniversalColorInput = ({ valueOKLCH, onChangeOKLCH, label, ...props }) => {
  const [displayValue, setDisplayValue] = useState(formatOKLCH(valueOKLCH));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleParse = (str: string) => {
    try {
      const color = parseCssColor(str);          // colorjs.io
      const oklch = toOKLCH(color);              // normalize
      setError(null);
      onChangeOKLCH(oklch);
      return true;
    } catch (e) {
      setError("Invalid color value");
      return false;
    }
  };

  const handleInputChange = (e) => setDisplayValue(e.target.value);
  const handleInputCommit = () => handleParse(displayValue);

  const handlePickerChange = (pickerColor) => {
    const oklch = pickerToOKLCH(pickerColor);    // map picker model to OKLCH
    setDisplayValue(formatOKLCH(oklch));
    setError(null);
    onChangeOKLCH(oklch);
  };

  return (
    <Field>
      <Label>{label}</Label>
      <div className="relative flex items-center gap-2">
        <input value={displayValue} onChange={handleInputChange} onBlur={handleInputCommit} onKeyDown={onEnter(handleInputCommit)} />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger aria-label="Open color picker" />
          <PopoverContent>
            <ColorPicker value={oklchToPicker(valueOKLCH)} onChange={handlePickerChange} />
            <AlphaSlider value={valueOKLCH.a} onChange={...} />
          </PopoverContent>
        </Popover>
        <Swatch style={{ background: oklchToDisplay(valueOKLCH) }} />
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </Field>
  );
};
```

#### Implementation Steps
1. Add `colorjs.io` and `react-colorful` to dependencies.
2. Create `features/theme-tweaker/components/common/UniversalColorInput.tsx` as the reusable component.
3. Wrap `react-colorful` inside shadcn `Popover` and shadcn-like controls; style with Tailwind.
4. Implement robust parsing helpers:
   - `parseCssColor(str)`: accepts any CSS color → internal representation.
   - `toOKLCH(color)`: converts to OKLCH, preserves alpha, gamut-map as needed.
   - `formatOKLCH(oklch)`: canonical string for display when needed.
   - `oklchToDisplay(oklch)`: returns CSS `oklch()` or hex for preview.
5. Replace existing color input usages in Theme Tweaker with `UniversalColorInput`.
6. Remove the `lab(...)` (or similar) text from the UI next to labels.
7. QA: keyboard navigation, screen reader labels, error states, alpha support, gamut mapping.

#### Acceptance Criteria
- Clicking the right-side icon opens a modern color picker in a popover; selecting a color updates the value and preview.
- The text input accepts any valid CSS color and converts it to OKLCH; invalid input shows a clear error without breaking state.
- Alpha is round-trippable via both input and picker.
- Out-of-gamut inputs are safely gamut-mapped; preview reflects final display color.
- The `lab(...)` readouts are no longer visible in the UI.
- Component is reusable and lives in `features/theme-tweaker/components/common/` with clean props and Tailwind-only styling.

#### Notes
- Keep page components as Server Components; mount this control where appropriate as a Client Component.
- Do not change data fetching or routing; only UI/control-level edits.

