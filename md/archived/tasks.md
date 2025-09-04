# Admin Boilerplate Standardization Tasks

This checklist tracks the standardization tasks discussed. We’ll tick items as they’re completed.

## 1) Imports: Standardize `cn` import path

- [x] Replace all `@/utils/cn` imports with `@/lib/utils`
  - [x] `src/components/layout/Sidebar.tsx`
  - [x] `src/components/layout/InnerSidebar.tsx`
  - [x] `src/components/layout/MobileSidebar.tsx`
  - [x] `src/components/sidebar/SidebarThemeControl.tsx`
- [x] Remove `src/utils/cn.ts` re-export to prevent drift

Status: Done

## 2) Naming: Align Notifications file and component name

- [x] Rename default component to match file name
  - File: `src/components/common/Notifications.tsx`
  - Change: `NotificationBell` → `Notifications` (default export)

Status: Done

## 3) Props/className: Add `className` and pass-through

Add `className?: string` and wire to the root container with `cn(...)` where applicable.

- [x] `src/components/common/PaginationBar.tsx`
- [x] `src/components/common/DrawerForm.tsx`
- [x] `src/components/common/FiltersDrawer.tsx`
- [x] `src/components/common/Notifications.tsx` (applies to trigger button)
- [x] `src/components/common/ToolbarChips.tsx`
- [x] `src/components/common/DateRangePicker.tsx`
- [x] `src/components/common/SmallCalendar.tsx`
- [x] `src/components/common/SidePanel.tsx`

Status: Done

## 4) Types: Export `XProps` types and keep default export

Export explicit props types for updated components to standardize usage.

- [x] `NotificationsProps`
- [x] `PaginationBarProps`
- [x] `DrawerFormProps<TSchema>`
- [x] `FiltersDrawerProps`
- [x] `ToolbarChipsProps`
- [x] `DateRangePickerProps` (+ `DateRange`)
- [x] `SmallCalendarProps`
- [x] `SidePanelProps`

Status: Done

## 5) Docs: Update README references

- [x] Replace NotificationBell usage with Notifications in README

Status: Done

---

If we add more components to this effort later, append them here and keep progress updated.

## 6) Fix shadcn Button duplicate attribute

- [x] Remove duplicate `data-size` attribute in `src/components/ui/button.tsx`

Status: Done
