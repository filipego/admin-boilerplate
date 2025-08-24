# Branding handoff spec (what to send from Figma)

Use this as a checklist and template for providing a complete style guide I can wire into the CSS tokens in `src/app/globals.css` without touching individual components.

## 1) Color system
Provide both Light and Dark values. OKLCH preferred (or HEX/RGB; I'll convert).

Required tokens (light and dark):
- Primary: brand color used for buttons/links
- Accent: subtle surfaces/hover states
- Semantic: success, warning, destructive
- Neutral/border/input: muted, border, input, ring

Optional: Chart palette (5 colors)

Template (JSON)
```json
{
  "light": {
    "primary": "oklch(0.6 0.15 250)",
    "accent": "oklch(0.97 0 0)",
    "muted": "oklch(0.97 0 0)",
    "border": "oklch(0.92 0 0)",
    "input": "oklch(0.92 0 0)",
    "ring": "oklch(0.70 0 0)",
    "destructive": "oklch(0.58 0.24 27)",
    "success": "#16a34a",
    "warning": "#f59e0b",
    "chart": ["#3b82f6", "#22c55e", "#06b6d4", "#f59e0b", "#a855f7"]
  },
  "dark": {
    "primary": "oklch(0.8 0.10 250)",
    "accent": "oklch(0.27 0 0)",
    "muted": "oklch(0.27 0 0)",
    "border": "oklch(1 0 0 / 10%)",
    "input": "oklch(1 0 0 / 15%)",
    "ring": "oklch(0.56 0 0)",
    "destructive": "oklch(0.70 0.19 22)",
    "success": "#22c55e",
    "warning": "#f59e0b",
    "chart": ["#60a5fa", "#34d399", "#67e8f9", "#fbbf24", "#c084fc"]
  }
}
```

Notes
- If you already have a neutral gray scale, include it; I'll map to muted/border/input as needed.
- Ensure contrast (WCAG AA): primary vs background should be >= 4.5:1 for body text or >= 3:1 for large text.

## 2) Radius & shape
- Global radius `--radius` (e.g., `0px`, `6px`, `12px`)
- If you want different sizes: sm/md/lg radii (I'll derive from `--radius` unless you specify)

Template
```json
{ "radius": "12px" }
```

## 3) Shadows / elevation
Provide CSS box-shadows (use Tailwind-like or raw CSS). These power:
- `--shadow-card` (cards/buttons)
- Optional elev-1/2/3 presets

Template
```json
{
  "shadowCard": "0 8px 24px rgba(0,0,0,.08)",
  "elev1": "0 1px 2px rgba(0,0,0,.06)",
  "elev2": "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)"
}
```

## 4) Typography (optional)
- Sans font family + fallbacks
- Mono font family (for code)
- Scale: h1–h6 sizes/weights, body, small

Template
```json
{
  "fontSans": "Inter, ui-sans-serif, system-ui, sans-serif",
  "fontMono": "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
  "scale": {
    "h1": { "size": "2rem", "weight": 700 },
    "h2": { "size": "1.5rem", "weight": 700 },
    "body": { "size": "0.95rem", "weight": 500 }
  }
}
```

## 5) Density / spacing (optional)
- Base spacing unit (e.g., 4px, 8px)
- Component density (comfortable/compact)

Template
```json
{ "spacingBase": 8, "density": "comfortable" }
```

## 6) Component notes (optional)
If you have specific looks:
- Button: border radius, shadow on hover, text-case
- Cards: border on/off, hover lift
- Inputs: border on/off, focus ring color

Write brief bullets:
```
Buttons: medium radius, subtle shadow, uppercase labels
Cards: no border, stronger shadow on hover
Inputs: visible border, ring uses primary color
```

## 7) Assets
- Logo SVG (light + dark variants if applicable)
- Favicon (SVG/PNG)
- Brand illustrations if any (SVG preferred)

## 8) Delivery format
- Paste JSON snippets above, or send a single `brand.json` with sections `{ colors, radius, shadows, typography, spacing }`.
- If using Figma Styles: export a list or share tokens; I'll translate.

---

## How I'll apply it
- Map tokens to CSS variables in `src/app/globals.css`:
  - Colors -> `--primary`, `--accent`, `--muted`, `--border`, etc., with `.dark` overrides
  - Radius -> `--radius`
  - Shadows -> `--shadow-card` (+ optional presets)
- Components already consume these tokens (cards/buttons); I'll extend to inputs and other primitives as needed.

## Quick example (minimal)
```
Colors
- primary light: #3B82F6, dark: #60A5FA
- accent light: #F4F4F5, dark: #27272A
- destructive: #EF4444

Radius
- 10px

Shadow
- card: 0 8px 24px rgba(0,0,0,.08)
```

Send this file filled, or just send values inline; I'll wire them up quickly.
