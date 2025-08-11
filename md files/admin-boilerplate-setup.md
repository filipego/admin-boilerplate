npm # Admin Boilerplate Setup

## 1. Install dependencies

Run:

```bash
# ShadCN setup
npx shadcn-ui@latest init

# Install required packages
npm install lucide-react class-variance-authority tailwind-variants clsx tailwind-merge \
react-hook-form zod next-themes framer-motion zustand
```

> Note: ShadCN components will auto-install Radix UI primitives as needed.

---

## 2. Create `utils/cn.ts` helper

```ts
// utils/cn.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 3. Project layout

- **`components/layout/Sidebar.tsx`**
  - Collapsible, persistent state (using Zustand + localStorage).
  - Sections:
    - Main menu (Overview, Clients, Projects, Proposals, Users, Profile)
    - Personal menu (Notes, Bookmarks)
  - All menu items OFF by default, toggled via settings.

- **`components/layout/Header.tsx`**
  - Left: Logo (click → `/` main screen)
  - Right: Notifications, Theme switch, Profile (avatar with optional name OFF by default), Logout button.
  - Ability to hide right-side options and move them to Sidebar.

- **`components/layout/MainContent.tsx`**
  - Displays active tab name + placeholder content until real data.

- **`components/layout/Layout.tsx`**
  - Wraps Sidebar + Header + MainContent.
  - Handles responsive breakpoints.

---

## 4. Basic pages

### `/login`
- Form: email, password (react-hook-form, zod schema but logic optional for now).
- Submit button → redirects to `/` even if fields are empty.
- No Supabase or auth logic yet — hardcoded redirect.

### `/`
- Dashboard Overview (hardcoded data for clients, projects, tasks).
- Components for:
  - **Stat cards** (Total Clients, Active Projects, Total Projects)
  - **Recent Clients**
  - **Recent Projects**
  - **Next Tasks**

> All data is hardcoded arrays — easy to replace with API/db later.

---

## 5. State management with persistence

For sidebar collapse persistence:

```ts
// store/sidebar.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

type SidebarState = {
  collapsed: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    { name: "sidebar-storage" }
  )
)
```

For theme persistence (`next-themes` handles this internally):

```ts
// pages/_app.tsx or app/layout.tsx (App Router)
import { ThemeProvider } from "next-themes"

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
```

---

## 6. Theming

- Install and configure `next-themes` for light/dark/system toggle.
- Add `<ThemeProvider>` to `_app.tsx` or `app/layout.tsx`.
- Use ShadCN `ModeToggle` component in Header.

---

## 7. Suggested ShadCN components to add now

From ShadCN’s CLI:

```bash
npx shadcn-ui@latest add button card table avatar dropdown-menu tooltip
```

These will cover:
- Buttons (login, toggles, logout)
- Cards (stat cards, dashboard sections)
- Tables (tasks)
- Avatar (profile pic)
- Dropdown menu + Tooltip (header actions)

---

## 8. Next steps after boilerplate

- Swap hardcoded data with API/db logic.
- Add Supabase or chosen backend auth.
- Expand sidebar + header settings panel.
- Add animations (Framer Motion) for sidebar transitions.

---

**Notes for AI in Cursor:**
- Use **universal components** where it makes sense (cards, tables, buttons).
- All hardcoded data should be in a `data/` folder for easy swapping later.
- Keep styling consistent with ShadCN defaults + Tailwind utilities.
- Avoid over-testing — only test if needed for core components.
