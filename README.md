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

### Toasts (centralized)
`src/lib/toast.ts`

Helpers: `showSaved, showError, showAvatarUpdated, showUploadFailed, showBucketMissing, showBucketCreated`

Toaster is mounted in `src/components/providers/ThemeProvider.tsx` (top-center, rich colors).

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
