-- Fix recursive RLS on profiles causing "stack depth limit exceeded"
-- Root cause: policy used public.is_admin() which queried profiles again.

alter table public.profiles enable row level security;

-- Drop the recursive policy if present
do $$ begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_admin_all'
  ) then
    drop policy profiles_select_admin_all on public.profiles;
  end if;
end $$;

-- Allow authenticated users to select their own profile row only
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_own'
  ) then
    create policy profiles_select_own on public.profiles
      for select to authenticated
      using (auth.uid() = id);
  end if;
end $$;

-- Allow authenticated users to update their own profile row (optional, safe)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own'
  ) then
    create policy profiles_update_own on public.profiles
      for update to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;


