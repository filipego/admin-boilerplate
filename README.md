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
```

### Database

Run the SQL in `supabase/migrations` on your Supabase project to create required tables and policies.
