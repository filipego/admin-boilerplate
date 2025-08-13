-- Allow authenticated users to insert their own profile row (needed for upsert on first login)

alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own'
  ) then
    create policy profiles_insert_own on public.profiles for insert to authenticated with check (auth.uid() = id);
  end if;
end $$;


