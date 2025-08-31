## Components Roadmap

Status legend: [x] done, [ ] pending

### Core UI (done)
- [x] UIButton (sizes sm/md/lg)
- [x] SearchBar + ViewFilters (list/grid/masonry; 2–4 columns)
- [x] UICard (image/no-image, actions, linking)
- [x] UIModal (content/fullscreen)
- [x] UIModalTwoColumn (independent scrolling columns)
- [x] UIConfirm (AlertDialog wrapper)
- [x] PageHeader (title/description + optional action)
- [x] ContentTabs (icons + count badges)
- [x] Global toasts (`sonner`)
- [x] Sidebar config + realtime profile

### Data & Forms
- [x] DataTable wrapper (TanStack Table): client-side search/sort/pagination, selection groundwork, toolbar (search/export). Server-side mode pending.
- [x] Form system: React Hook Form + Zod + fields (text/textarea); extend with more field types
- [x] StatusBadge/Chip: semantic colors and sizes

### Analytics & Visualization
- [x] KPI StatCards: number, delta (sparkline pending)
- [x] Chart wrapper (Recharts) themed with tokens

### Navigation & Filters
- [x] Filters Drawer/Sheet with reset/apply
- [x] Pagination bar (basic)
- [x] Breadcrumbs with optional action slot

### States & UX
- [x] Empty/Loading/Error states (skeletons, retry)
- [x] ModalForm wrapper (create/edit with RHF, async submit, optimistic toasts)
 - [x] CommandPalette (cmd+k) for quick nav/actions
 - [x] Stepper/Wizard (horizontal; vertical and per-step validation pending)
 - [x] AuditLog / ActivityFeed (timeline list; realtime pending)
- [ ] AccessControl helpers (`Can`, `RequireRole`, `useAbility`)

### Calendars
- [x] Small calendar (date picker)
- [x] Full calendar (basic monthly grid; weekly/events advanced pending)

### Additional Admin Patterns
- [ ] Access control utilities: `Can`, `RequireRole`, permissions matrix editor
- [x] (basic) Access control helpers: provider + Can/RequireRole
- [x] (basic) Notifications center (bell + sheet)
- [ ] Saved views (persisted table filters/sorts)
- [x] (basic) Date range picker
- [x] Drawer form pattern (right-side create/edit)
- [x] Side panel details (master-detail view)
- [x] (basic) CSV importer with field mapping; JSON export helpers pending
- [x] (basic) Tag/label input (create/remove); async search pending
- [x] (basic) Tag input (create/remove)
- [x] User avatar menu (profile, sign out, env indicator; theme toggle optional)
- [x] Settings layout (sticky sidebar sections, autosave)
- [x] Feature flags toggles
- [x] Error boundary + retry component
- [x] Global search (header)
 - [x] Kanban/board (drag-and-drop) (same-column reordering)
- [x] Toolbar chips for active filters

  - [x] Tooltip helpers (UITooltip, HelpTooltip)
  - [x] Copy to clipboard button with tooltip feedback
  - [x] KBD (keyboard hint) inline component
  - [x] Mini progress bar for multi-step forms
  - [x] Loading overlay for sections
  - [x] Toast convenience hooks (success/error with actions)
  - [x] Empty state illustration slots

### Theming & Branding
- [ ] Central tokens (colors, radius, spacing, typography, chart palette)
- [ ] Density + radius toggles (comfortable/compact; sm/md/lg)
- [ ] Typography scale via CSS vars
- [ ] Environment indicator banner (dev/staging/prod)

Notes:
- We will not build the file uploader here (will reuse your other project’s uploader with compression options).
- Add requests here as new checkboxes to track scope.


