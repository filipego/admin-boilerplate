# UI Context

## Theme

The boilerplate uses a token-driven dashboard UI with light and dark themes. The visual system is meant to be quiet, utilitarian, and reusable across admin products. Use restrained surfaces, clear hierarchy, compact controls, predictable navigation, and dense but readable layouts.

## Colors

Colors are defined as CSS custom properties in `src/app/globals.css` and surfaced to Tailwind through `@theme inline`. Components should use Tailwind token classes such as `bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, and semantic token utilities where available.

| Role | CSS Variable |
| --- | --- |
| Page background | `--background` |
| Main text | `--foreground` |
| Card surface | `--card` |
| Card text | `--card-foreground` |
| Popover surface | `--popover` |
| Primary action | `--primary` |
| Secondary surface | `--secondary` |
| Muted surface | `--muted` |
| Accent surface | `--accent` |
| Border | `--border` |
| Input border/background | `--input` |
| Focus ring | `--ring` |
| Destructive state | `--destructive` |
| Success state | `--success` |
| Warning state | `--warning` |
| Error state | `--error` |
| Info state | `--info` |
| Brand palette | `--brand-1` through `--brand-6` |
| Charts | `--chart-1` through `--chart-5` |
| Sidebar | `--sidebar` and related sidebar tokens |

Do not add hardcoded hex, RGB, OKLCH, or named colors in components unless the task is explicitly updating token definitions or a documented isolated tool surface.

## Typography

| Role | Font/Variable |
| --- | --- |
| UI text | Geist Sans through `--font-geist-sans` and `--font-sans` |
| Code/mono | Geist Mono through `--font-geist-mono` and `--font-mono` |
| Headings | `Heading` component using `--h-*` tokens |

Use `src/components/common/Heading.tsx` for headings. Heading sizes map to `ui-h-2xl`, `ui-h-xl`, `ui-h-lg`, `ui-h-md`, `ui-h-sm`, and `ui-h-xs`.

## Border Radius and Shadows

| Context | Token/Pattern |
| --- | --- |
| Base radius | `--radius` |
| Tailwind radii | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` |
| Card shadow | `--shadow-card` |
| Popover shadow | `--shadow-popover` |
| Elevation | `--shadow-elev-1`, `--shadow-elev-2`, `--shadow-elev-3` |

Keep cards and panels compact. Do not introduce large rounded decorative containers unless they match an existing wrapper pattern.

## Component Library

- `src/components/ui` contains base shadcn/Radix primitives.
- `src/components/common` contains app-facing wrappers and reusable components.
- Pages and feature modules must use common wrappers instead of base primitives.
- If a wrapper is missing, create a small wrapper in `src/components/common` before using the primitive in app-facing code.
- Import `cn` from `@/lib/utils`.

Common wrappers include:

- `UIButton`
- `UICard`
- `UIAvatar`
- `UIModal`
- `UIModalTwoColumn`
- `UIConfirm`
- `PageHeader`
- `Heading`
- `ContentTabs`
- `DataTable`
- `StatusBadge`
- `StatCard`
- `Chart`
- `SearchBar`
- `ViewFilters`
- `FiltersDrawer`
- `PaginationBar`
- `AsyncStates`
- `LoadingOverlay`
- `Loader`
- `UITooltip`
- `CopyButton`
- `UserAvatarMenu`
- `DateRangePicker`
- `CommandPalette`
- `TagInput`
- `KanbanBoard`
- `NotesBoard`
- `CompressionSettings`
- `form/Form` and `form/Fields`

`DataTable` composes the shadcn table primitive through the common wrapper layer and supports sortable headers, empty states, and optional export actions. Form fields should use `form/Form` and `form/Fields` so labels, invalid states, and shared input styling stay consistent across starter projects. Use `UIAvatar` for profile/avatar display outside the common layer instead of importing avatar primitives directly.

## Layout Patterns

- Root app shell lives in `src/app/layout.tsx`.
- Authenticated shell uses Sidebar on desktop and Header above page content.
- Page content should use `src/components/layout/Layout.tsx` or `MainContent` patterns where appropriate.
- Navigation items belong in `src/components/layout/sidebar.config.ts`.
- Avoid hardcoding route lists in pages.
- Use dashboard-style layouts with clear sections and scan-friendly controls.

## Icons

- Use `lucide-react`.
- Prefer icons inside buttons and compact controls when the action is familiar.
- Use sizes consistent with existing components, commonly `h-4 w-4` inline and `h-5 w-5` for larger controls.
- Add accessible labels or tooltips for icon-only actions.

## Theme Tweaker UI

`features/theme-tweaker` contains an older specialized tool surface with some existing hardcoded colors and larger files. Treat that as existing technical debt unless the task is specifically about the Theme Tweaker. New general app UI should still follow the token and wrapper rules.
