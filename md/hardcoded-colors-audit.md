# Hardcoded Colors Audit

## Overview
This document catalogs all hardcoded color classes and values found in the codebase that are not defined in `globals.css`. The goal is to identify these colors and create a strategy to either move them to global CSS tokens or remove them entirely.

## Current Color Tokens in globals.css
The following color tokens are already properly defined in `globals.css`:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--chart-1` through `--chart-5`
- `--sidebar-*` variants
- `--brand-1` through `--brand-6`

## Hardcoded Colors Found

### 1. Status Badge Colors (StatusBadge.tsx)
**File:** `src/components/common/StatusBadge.tsx`

**Colors Found:**
- `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300` (success)
- `bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300` (warning)
- `bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300` (destructive)
- `bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300` (info)
- `bg-emerald-500` (success dot)
- `bg-amber-500` (warning dot)
- `bg-rose-500` (destructive dot)
- `bg-sky-500` (info dot)

**Usage:** Status indicators for different message types
**Priority:** High - These are semantic colors that should be tokenized

### 2. Form Validation Colors
**Files:** 
- `src/app/login/LoginForm.tsx`
- `src/app/profile/ProfileViewEdit.tsx`

**Colors Found:**
- `text-red-500` (error messages)
- `text-green-600` (success messages)

**Usage:** Form validation feedback
**Priority:** High - These are semantic colors that should be tokenized

### 3. Compression Settings Colors (CompressionSettings.tsx)
**File:** `src/components/common/CompressionSettings.tsx`

**Colors Found:**
- `text-emerald-600` (savings text)
- `text-emerald-700 bg-emerald-50` (info box)

**Usage:** Success/positive feedback for compression results
**Priority:** Medium - These could use existing success tokens

### 4. Notification Badge (Notifications.tsx)
**File:** `src/components/common/Notifications.tsx`

**Colors Found:**
- `bg-blue-500` (notification indicator)

**Usage:** Notification count badge
**Priority:** Medium - Could use existing primary or accent tokens

### 5. Calendar Today Indicator (FullCalendar.tsx)
**File:** `src/components/common/FullCalendar.tsx`

**Colors Found:**
- `border-blue-500` (today's date border)

**Usage:** Highlighting today's date in calendar
**Priority:** Medium - Could use existing primary or accent tokens

### 6. Theme Tweaker Highlighting (globals.css)
**File:** `src/app/globals.css`

**Colors Found:**
- `#22c55e` (green outline for theme tweaker)

**Usage:** Visual highlighting for theme tweaker tool
**Priority:** Low - This is tool-specific and could remain as-is

### 7. Chart Default Color (Chart.tsx)
**File:** `src/components/common/Chart.tsx`

**Colors Found:**
- `#3b82f6` (default chart color)

**Usage:** Default color for charts when no color is specified
**Priority:** Medium - Could use existing chart or primary tokens

### 8. SVG Icon Colors (public/*.svg)
**Files:** Various SVG files in public directory

**Colors Found:**
- `#666` (gray icons)
- `#fff` (white backgrounds)
- `#000` (black text)

**Usage:** Static SVG assets
**Priority:** Low - These are static assets and may not need tokenization

## Strategy Recommendations

### Phase 1: High Priority Semantic Colors
1. **Create semantic color tokens** for status indicators:
   ```css
   --status-success: var(--brand-4);
   --status-warning: var(--brand-5);
   --status-error: var(--brand-6);
   --status-info: var(--brand-2);
   ```

2. **Create form validation tokens**:
   ```css
   --validation-error: var(--brand-6);
   --validation-success: var(--brand-4);
   ```

### Phase 2: Medium Priority Colors
1. **Replace notification badge** with existing primary token
2. **Replace calendar today indicator** with existing primary token
3. **Replace compression success colors** with existing success tokens
4. **Replace chart default color** with existing chart-1 token

### Phase 3: Low Priority Colors
1. **Keep theme tweaker highlighting** as-is (tool-specific)
2. **Keep SVG colors** as-is (static assets)

## Implementation Plan

### Step 1: Add New Color Tokens
Add the following to `globals.css`:
```css
:root {
  /* Status colors */
  --status-success: var(--brand-4);
  --status-warning: var(--brand-5);
  --status-error: var(--brand-6);
  --status-info: var(--brand-2);
  
  /* Validation colors */
  --validation-error: var(--brand-6);
  --validation-success: var(--brand-4);
  
  /* Notification colors */
  --notification-indicator: var(--primary);
  
  /* Calendar colors */
  --calendar-today: var(--primary);
}

.dark {
  /* Dark theme variants if needed */
  --status-success: var(--brand-4);
  --status-warning: var(--brand-5);
  --status-error: var(--brand-6);
  --status-info: var(--brand-2);
  
  --validation-error: var(--brand-6);
  --validation-success: var(--brand-4);
  
  --notification-indicator: var(--primary);
  --calendar-today: var(--primary);
}
```

### Step 2: Update Components
1. **StatusBadge.tsx**: Replace hardcoded colors with CSS variables
2. **Form components**: Replace hardcoded validation colors
3. **CompressionSettings.tsx**: Use success tokens
4. **Notifications.tsx**: Use primary token
5. **FullCalendar.tsx**: Use primary token
6. **Chart.tsx**: Use chart-1 token

### Step 3: Create Utility Classes
Add Tailwind utilities for the new tokens:
```css
@layer utilities {
  .bg-status-success { background-color: var(--status-success); }
  .bg-status-warning { background-color: var(--status-warning); }
  .bg-status-error { background-color: var(--status-error); }
  .bg-status-info { background-color: var(--status-info); }
  
  .text-validation-error { color: var(--validation-error); }
  .text-validation-success { color: var(--validation-success); }
}
```

## Benefits of This Approach
1. **Consistent theming** across all components
2. **Easier maintenance** - change colors in one place
3. **Better dark mode support** - automatic dark variants
4. **Semantic meaning** - colors have clear purposes
5. **Theme tweaker compatibility** - all colors can be adjusted

## Questions for Consideration
1. Should we create separate light/dark variants for status colors?
2. Do we want to allow users to customize status colors via theme tweaker?
3. Should we create a more comprehensive semantic color system?
4. Are there any other color patterns we should standardize?

## Next Steps
1. Review and approve this strategy
2. Implement Phase 1 (high priority semantic colors)
3. Test with theme tweaker to ensure compatibility
4. Implement Phase 2 (medium priority colors)
5. Document new color system for developers
