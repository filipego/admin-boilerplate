## Setup

Install dependencies and run dev server:

```bash
npm i
npm run dev
```

### Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional: auto-promote admins on login (comma-separated emails)
ADMIN_EMAILS=
```

### Database & Storage

Apply migrations in order:

- `supabase/migrations/0001_init.sql` → profiles table, triggers, RLS, RPC
- `supabase/migrations/0002_profile_roles_and_storage.sql` → role column, admin RLS, avatars bucket + storage RLS

Notes:
- Avatars are stored in bucket `avatars` under `avatars/{userId}/...`
- Public read; users can only write/update/delete their own folder

## Components

### UIButton (shadcn wrapper)
`src/components/common/UIButton.tsx`

Props: all shadcn Button props plus `uiSize: "sm" | "md" | "lg"` (default md). Defaults to `type="button"`.

```tsx
import UIButton from "@/components/common/UIButton";

<UIButton uiSize="sm">Small</UIButton>
<UIButton>Medium</UIButton>
<UIButton uiSize="lg" variant="outline">Large</UIButton>
// As link
<UIButton asChild><Link href="/users/new">New User</Link></UIButton>
```

### UIModal (Dialog wrapper)
`src/components/common/UIModal.tsx`

Props: `{ open, onOpenChange, title, description?, size?: "content"|"fullscreen", hideTitleVisually?, className?, disableScrollWrapper? }`

```tsx
import UIModal from "@/components/common/UIModal";

<UIModal
  open={open}
  onOpenChange={setOpen}
  title="My Modal"
  description="Optional description"
  size="content"
>
  <div>Body content...</div>
  <div className="mt-4 flex justify-end gap-2">
    <UIButton onClick={() => setOpen(false)}>Save</UIButton>
    <UIButton variant="outline" onClick={() => setOpen(false)}>Cancel</UIButton>
  </div>
</UIModal>
```

Accessibility: internally uses `DialogTitle`/`DialogDescription`. Overlay has blur. Close “X” is hoverable and works in light/dark.

### UIModalTwoColumn
`src/components/common/UIModalTwoColumn.tsx`

Two columns inside a modal. Columns scroll independently.

Props: `{ open, onOpenChange, title, description?, size?, hideTitleVisually?, className?, columnsClassName?, gapClassName?, left, right, leftClassName?, rightClassName? }`

```tsx
import UIModalTwoColumn from "@/components/common/UIModalTwoColumn";

<UIModalTwoColumn
  open={open}
  onOpenChange={setOpen}
  title="Two Columns"
  size="fullscreen"
  columnsClassName="md:grid-cols-2"
  left={<div>Left content</div>}
  right={<div>Right content</div>}
/> 
```

### UIConfirm (AlertDialog wrapper)
`src/components/common/UIConfirm.tsx`

Centralized confirmations using shadcn/AlertDialog and our `UIButton`.

```tsx
import UIConfirm from "@/components/common/UIConfirm";
import { MESSAGES } from "@/lib/messages";

<UIConfirm
  open={open}
  onOpenChange={setOpen}
  title={MESSAGES.confirmDelete.title}
  description={MESSAGES.confirmDelete.description}
  confirmLabel={MESSAGES.confirmDelete.confirmLabel}
  cancelLabel={MESSAGES.confirmDelete.cancelLabel}
  destructive
  onConfirm={handleDelete}
/> 
```

### UICard
`src/components/common/UICard.tsx`

Content card with optional full-bleed top image, 3-dots menu (edit/delete), and linking options.

Props: `{ title, description?, imageUrl?, onEdit?, onDelete?, href?, buttonHref?, buttonLabel? }`

Rules:
- If `imageUrl` is present, the image fills full width at the top with no padding; the card automatically removes its default top padding (`pt-0`) so the image is truly flush. Menu appears over the image.
- If no `imageUrl`, content area has extra top padding so text layout looks balanced; menu appears in header row.
- Use `href` for full-card link overlay; or `buttonHref`/`buttonLabel` for a button link in the footer.
- For external images, make sure the domain is allowed in `next.config.ts` under `images.domains`. Example in this repo allows `cdn.midjourney.com`. You can add more as needed.
- If you run into optimization/CDN issues during development, pass `unoptimizedImage` to bypass Next Image optimization for that card.

```tsx
import UICard from "@/components/common/UICard";

<UICard
  title="Card with Image"
  description="Description"
  imageUrl="https://cdn.midjourney.com/73e48e39-046e-4033-808a-577d4b3ad526/0_0.png"
  unoptimizedImage
  onEdit={() => {}}
  onDelete={() => {}}
  buttonHref="/users"
  buttonLabel="Open"
/>

<UICard
  title="Card without Image"
  description="Description"
  href="/dashboard"
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

### PageHeader
`src/components/common/PageHeader.tsx`

Simple page title block with optional description and a right-aligned action (e.g., button or link).

Props: `{ title: string, description?: string, action?: React.ReactNode, className?: string }`

```tsx
import PageHeader from "@/components/common/PageHeader";
import UIButton from "@/components/common/UIButton";

<PageHeader
  title="Notes"
  description="Personal notes and documentation for planning and brainstorming"
  action={<UIButton>New Note</UIButton>}
/>;
```

### ContentTabs
`src/components/common/ContentTabs.tsx`

Tabs for separating content areas. Supports optional icons and count badges per tab.

Types:
`TabItem = { id: string; label: string; icon?: React.ReactNode; count?: number; content: React.ReactNode }`

Props: `{ items: TabItem[], value: string, onValueChange: (id: string) => void, className?, listClassName?, fullWidthList? }`

```tsx
import ContentTabs, { type TabItem } from "@/components/common/ContentTabs";

const [active, setActive] = useState("all");
const tabs: TabItem[] = [
  { id: "all", label: "All Notes", count: 13, content: <div>All notes</div> },
  { id: "pinned", label: "Pinned Notes", count: 3, content: <div>Pinned</div> },
  { id: "uncategorised", label: "Uncategorised", count: 1, content: <div>Misc</div> },
  { id: "shared", label: "Shared with Me", count: 1, content: <div>Shared</div> },
];

<ContentTabs items={tabs} value={active} onValueChange={setActive} />
```

### DataTable
`src/components/common/DataTable.tsx`

Wrapper around TanStack Table with search, sort, pagination, and an export button. Designed to be themeable and extended with bulk actions.

Props: `{ columns, data, searchPlaceholder?, initialPageSize?, className? }`

```tsx
import DataTable from "@/components/common/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

type Person = { name: string; email: string; role: string };
const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

<DataTable columns={columns} data={[{ name: "Alice", email: "a@x.com", role: "Admin" }]} />
```

### Form System (RHF + Zod)
`src/components/common/form/Form.tsx`, `src/components/common/form/Fields.tsx`

Simple, extensible form setup with React Hook Form and Zod. Includes text and textarea fields with labels, descriptions, and error messages. Extend with more field types as needed.

```tsx
import { RHFForm } from "@/components/common/form/Form";
import { TextField, TextAreaField } from "@/components/common/form/Fields";
import { z } from "zod";

const profileSchema = z.object({ displayName: z.string().min(2), bio: z.string().max(200).optional() });

<RHFForm
  schema={profileSchema}
  defaultValues={{ displayName: "", bio: "" }}
  onSubmit={(values) => console.log(values)}
>
  <TextField name="displayName" label="Display Name" />
  <TextAreaField name="bio" label="Bio" />
  <div className="flex justify-end"><UIButton type="submit">Save</UIButton></div>
</RHFForm>
```

### StatusBadge
`src/components/common/StatusBadge.tsx`

Semantic badges for statuses. Sizes: `sm` (default), `md`. Variants: `default`, `success`, `warning`, `destructive`, `info`.

```tsx
import StatusBadge from "@/components/common/StatusBadge";

<StatusBadge>Default</StatusBadge>
<StatusBadge status="success">Active</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
<StatusBadge status="destructive">Error</StatusBadge>
<StatusBadge status="info">Info</StatusBadge>
```

### StatCard
`src/components/common/StatCard.tsx`

Compact KPIs: label, value, and delta status.

```tsx
import StatCard from "@/components/common/StatCard";

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard label="Revenue" value="$24,300" deltaLabel="+12%" deltaStatus="success" />
  <StatCard label="Active Users" value="1,204" deltaLabel="+2%" deltaStatus="info" />
  <StatCard label="Errors" value="7" deltaLabel="-18%" deltaStatus="success" />
  <StatCard label="Churn" value="3.2%" deltaLabel="+0.3%" deltaStatus="warning" />
</div>
```

### Chart (Recharts wrapper)
`src/components/common/Chart.tsx`

Simple themed line chart wrapper.

```tsx
import Chart from "@/components/common/Chart";

const data = [
  { x: "M1", y: 80 },
  { x: "M2", y: 64 },
  { x: "M3", y: 92 },
];

<Chart data={data} />
```

### Breadcrumbs
`src/components/common/Breadcrumbs.tsx`

```tsx
<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]} />
```

### PaginationBar
`src/components/common/PaginationBar.tsx`

```tsx
<PaginationBar page={1} pageCount={10} onPrev={() => {}} onNext={() => {}} />
```

### FiltersDrawer
`src/components/common/FiltersDrawer.tsx`

```tsx
<FiltersDrawer open={open} onOpenChange={setOpen} onApply={() => setOpen(false)} onReset={() => setOpen(false)}>
  <TextField name="q" label="Query" />
  <TextField name="tag" label="Tag" />
</FiltersDrawer>
```

### Async States
`src/components/common/AsyncStates.tsx`, `src/components/ui/skeleton.tsx`

```tsx
import { LoadingListSkeleton, EmptyState, ErrorState } from "@/components/common/AsyncStates";

<LoadingListSkeleton rows={4} />
<EmptyState actionLabel="Create Item" onAction={() => {}} illustration={<YourSvg />} />
<ErrorState onRetry={() => {}} />
```

### ModalForm
`src/components/common/ModalForm.tsx`

A modal wrapper for create/edit forms using RHF + Zod with optimistic toasts.

```tsx
import ModalForm from "@/components/common/ModalForm";
import { TextField, TextAreaField } from "@/components/common/form/Fields";
import { z } from "zod";

const schema = z.object({ displayName: z.string().min(2), bio: z.string().optional() });

<ModalForm
  open={open}
  onOpenChange={setOpen}
  title="Create Item"
  schema={schema}
  defaultValues={{ displayName: "", bio: "" }}
  onSubmit={async (values) => { /* async save */ }}
>
  <TextField name="displayName" label="Display Name" />
  <TextAreaField name="bio" label="Bio" />
</ModalForm>
```

### Stepper / Wizard
`src/components/common/Stepper.tsx`

```tsx
import Stepper from "@/components/common/Stepper";

const steps = [
  { id: 's1', title: 'Details', content: <div>...</div> },
  { id: 's2', title: 'Settings', content: <div>...</div> },
  { id: 's3', title: 'Review', content: <div>...</div> },
];

<Stepper steps={steps} active={0} onActiveChange={() => {}} />
```

### ActivityFeed
`src/components/common/ActivityFeed.tsx`

```tsx
<ActivityFeed items={[{ id: '1', title: 'User signed in', time: 'Just now' }]} />
```

### Access Control Helpers
`src/components/auth/Access.tsx`

```tsx
import { AbilityProvider, Can, RequireRole } from "@/components/auth/Access";

<AbilityProvider role="admin">
  <Can role="admin">Only admins see this</Can>
  <RequireRole role={["admin", "client"]} fallback={<div>No access</div>}>
    Shared content
  </RequireRole>
</AbilityProvider>
```

### TagInput
`src/components/common/TagInput.tsx`

```tsx
import TagInput from "@/components/common/TagInput";

<TagInput />
```

### Notifications
`src/components/common/Notifications.tsx`

```tsx
import NotificationBell from "@/components/common/Notifications";
<NotificationBell items={[{ id: '1', title: 'Welcome', time: 'Just now' }]} />
```

### Tooltip Helpers
`src/components/common/UITooltip.tsx`

Lightweight wrappers around shadcn Tooltip for consistent styling.

```tsx
import UITooltip, { HelpTooltip } from "@/components/common/UITooltip";

<HelpTooltip content="Explains what this section does" />

<UITooltip content="Click to save">
  <UIButton>Save</UIButton>
</UITooltip>
```

### Copy to Clipboard Button
`src/components/common/CopyButton.tsx`

```tsx
import CopyButton from "@/components/common/CopyButton";

<CopyButton value="https://example.com" withTooltip />
<CopyButton value="secret" label="Copy token" copiedLabel="Token copied" />
```

### KBD (keyboard hint)
`src/components/common/Kbd.tsx`

```tsx
import Kbd from "@/components/common/Kbd";

// Platform-aware: Mod → ⌘ on macOS, Ctrl elsewhere
<Kbd keys={["Mod", "K"]} />
<Kbd keys={["Shift", "Enter"]} size="sm" />
```

### Mini Progress Bar
`src/components/common/ProgressMini.tsx`

Variants:
- Steps: `variant="steps" current={n} total={m}`
- Percent: `variant="percent" value={0..100}`

```tsx
import ProgressMini from "@/components/common/ProgressMini";

// For a stepper wizard
<ProgressMini variant="steps" current={2} total={5} showLabel />

// For a task progress indicator
<ProgressMini variant="percent" value={64} showLabel />
```

### Loading Overlay + Loader
`src/components/common/LoadingOverlay.tsx`, `src/components/common/Loader.tsx`

```tsx
import LoadingOverlay from "@/components/common/LoadingOverlay";
import Loader from "@/components/common/Loader";

// Section loading overlay
<LoadingOverlay loading={isLoading}>
  <Chart data={data} />
</LoadingOverlay>

// Inline spinner
<Loader size="sm" />
```

## Branding (CSS tokens)

Edit `src/app/globals.css` to brand the entire UI without touching components:

- Radius: `--radius` (affects cards, buttons, inputs via `rounded-[var(--radius)]`)
- Shadows: `--shadow-card` (cards/buttons), plus `--shadow-elev-*` presets
- Colors: `--primary`, `--accent`, `--muted`, `--border`, etc. with `.dark { ... }` overrides

Example:
```css
:root {
  --radius: 12px;                    /* global rounding */
  --shadow-card: 0 8px 24px rgba(0,0,0,.08); /* global card/button shadow */
  --primary: oklch(0.6 0.15 250);    /* brand color */
}
.dark {
  --primary: oklch(0.8 0.1 250);
}
```

### UserAvatarMenu
`src/components/common/UserAvatarMenu.tsx`

```tsx
import UserAvatarMenu from "@/components/common/UserAvatarMenu";
<UserAvatarMenu user={{ name: 'Admin User', email: 'admin@example.com' }} />
```

### DateRangePicker
`src/components/common/DateRangePicker.tsx`

```tsx
<DateRangePicker />
```

### DrawerForm / SidePanel
`src/components/common/DrawerForm.tsx`, `src/components/common/SidePanel.tsx`

```tsx
<DrawerForm ...>...</DrawerForm>
<SidePanel open={open} onOpenChange={setOpen}>...</SidePanel>
```

### ToolbarChips
`src/components/common/ToolbarChips.tsx`

```tsx
<ToolbarChips chips={[{ id: 'status', label: 'Status: Active' }]} onRemove={() => {}} onClear={() => {}} />
```

### SettingsLayout
`src/components/common/SettingsLayout.tsx`

2-column settings page with sticky sidebar, active section highlighting, and simple autosave (localStorage).

```tsx
import SettingsLayout from "@/components/common/SettingsLayout";

<SettingsLayout
  sections={[
    { id: 'profile', title: 'Profile', content: <div>...</div> },
    { id: 'preferences', title: 'Preferences', content: <div>...</div> },
  ]}
/>
```

### FeatureFlags
`src/components/common/FeatureFlags.tsx`

```tsx
<FeatureFlags flags={[{ key: 'newDashboard', label: 'New Dashboard' }]} onChange={(s) => console.log(s)} />
```

### KanbanBoard
`src/components/common/KanbanBoard.tsx`

```tsx
<KanbanBoard
  initial=[
    { id: 'todo', title: 'To Do', cards: [{ id: 'c1', title: 'Task' }] },
    { id: 'doing', title: 'In Progress', cards: [] },
    { id: 'done', title: 'Done', cards: [] },
  ]
/>
```

### NotesBoard
`src/components/common/NotesBoard.tsx`

```tsx
<NotesBoard initial={[{ id: 'n1', text: 'First note' }]} />
```

### ErrorBoundary
`src/components/common/ErrorBoundary.tsx`

```tsx
import ErrorBoundary from "@/components/common/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### CSV Import
`src/components/common/CsvImport.tsx`

```tsx
<CsvImport fields={["name", "email", "role"]} onComplete={(rows) => console.log(rows)} />
```

### CommandPalette (cmd+k)
`src/components/common/CommandPalette.tsx`

Press Cmd/Ctrl + K to open.

```tsx
<CommandPalette
  items={[{ id: 'dashboard', label: 'Go to Dashboard', href: '/dashboard' }]}
  onSearch={async (q) => [{ id: 'users', label: `Search users for "${q}"`, href: '/users' }]}
/>
```

### Calendars
- Small calendar: `src/components/common/SmallCalendar.tsx`
- Full calendar (basic monthly grid): `src/components/common/FullCalendar.tsx`

```tsx
<SmallCalendar />
<FullCalendar events={[{ id: '1', title: 'Event', date: new Date() }]} />
```

Notes:
- Full calendar shows weekday headers, month navigation, selectable dates, and event chips.
- Day cells are square (`aspect-square`) and today is highlighted with a blue border.


### Toasts (centralized)
`src/lib/toast.ts`

Helpers: `showSaved, showError, showAvatarUpdated, showUploadFailed, showBucketMissing, showBucketCreated`

Toaster is mounted in `src/components/providers/ThemeProvider.tsx` (top-center, rich colors).

Action variants:

```tsx
import { showSuccessWithAction, showErrorWithRetry } from "@/lib/toast";

showSuccessWithAction("Profile updated", "View", () => router.push("/profile"));
showErrorWithRetry("Failed to save", () => retrySave(), { secondaryLabel: "Dismiss", onSecondary: () => {} });
```

### ImageCropUpload
`src/components/uploader/ImageCropUpload.tsx`

Crop/zoom preview (react-easy-crop) + compression (browser-image-compression) + upload to Supabase Storage.

Props: `{ userId, initialUrl?, onUploaded(url), folder? = "avatars", aspect? = 1 }`

```tsx
import ImageCropUpload from "@/components/uploader/ImageCropUpload";

<ImageCropUpload
  userId={user.id}
  initialUrl={profile.avatar_url}
  onUploaded={(url) => setAvatarUrl(url)}
/> 
```

### SearchBar
`src/components/common/SearchBar.tsx`

Universal search input with an optional right slot for actions (e.g., view filters).

Props: `{ query: string, onQueryChange: (q: string) => void, placeholder?, rightContent?, className? }`

```tsx
import SearchBar from "@/components/common/SearchBar";
import ViewFilters from "@/components/common/ViewFilters";

const [query, setQuery] = useState("");
const [mode, setMode] = useState<"list"|"grid-2"|"grid-3"|"grid-4"|"masonry">("grid-3");

<SearchBar
  query={query}
  onQueryChange={setQuery}
  rightContent={<ViewFilters mode={mode} onModeChange={setMode} />}
/>;
```

### ViewFilters
`src/components/common/ViewFilters.tsx`

Icon-only view mode selector. Separates layout type from column count.

Defaults:
- Layout: list
- Columns: 3
- Enabled controls: list and 3 columns only (others are disabled by default; enable per usage)

Props:
`{ layout: "list"|"grid"|"masonry", onLayoutChange, columns: 2|3|4, onColumnsChange, enableList?, enableGrid?, enableMasonry?, enableCols2?, enableCols3?, enableCols4? }`

Icon legend:
- List: lines icon
- 2 columns: two vertical rectangles icon
- 3 columns: three vertical rectangles icon
- 4 columns: four vertical rectangles icon
- Masonry: grid of small squares icon

Example usage with cards:

```tsx
<SearchBar
  query={query}
  onQueryChange={setQuery}
  rightContent={
    <ViewFilters
      layout={layout}
      onLayoutChange={setLayout}
      columns={columns}
      onColumnsChange={setColumns}
      enableList
      enableGrid
      enableMasonry
      enableCols2
      enableCols3
      enableCols4
    />
  }
/>
<div className="mt-3" />
{/* Render your items according to `mode` */}
```

Notes:
- Auto-creates `avatars` bucket on first upload and retries.
- Immediately persists `avatar_url` in profile editor example.

### Sidebar (config-driven)
`src/components/layout/sidebar.config.ts` → define items; `Sidebar.tsx` renders from config.

```ts
export const mainItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/examples", label: "Examples", icon: Briefcase },
  { href: "/users", label: "Users", icon: Users },
  { href: "/reports", label: "Reports / Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];
```

### InnerSidebar (content area)
`src/components/layout/InnerSidebar.tsx`

Resizable, persistent width sidebar for in-content use.

```tsx
import InnerSidebar from "@/components/layout/InnerSidebar";

const [tab, setTab] = useState("a");
<div className="grid grid-cols-[auto_1fr]">
  <InnerSidebar
    tabs={[{ id: "a", label: "Tab A" }, { id: "b", label: "Tab B" }]}
    activeTab={tab}
    onTabChange={setTab}
  />
  <main>...</main>
</div>
```

## Auth & Pages

- Login: email/username + password (Server Action). After sign-in, profile upsert + optional admin promotion from `ADMIN_EMAILS`.
- Profile: view/edit, username check, avatar upload, change password. Real-time header/sidebar updates.
- Users: admin-only; list + edit per user (username, role, avatar), real-time.

## Dev Helpers

Route handlers:
- `POST /api/dev/ensure-avatars-bucket` – create `avatars` bucket (service role required)
- `POST /api/dev/make-self-admin` – promote current user to admin (dev use)

## Examples

Visit `/examples` to see usage of UIButton, modals, SearchBar, ViewFilters, and cards in grid/masonry layouts.

### Live Demo

Check the hosted demo here: [admin-boilerplate demo](https://admin-boilerplate-blond.vercel.app/)

### Roadmap

See the running list of planned components and status in [`md files/components-roadmap.md`](md%20files/components-roadmap.md).
