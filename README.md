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

Visit `/examples` to see usage of UIButton and both modals.
