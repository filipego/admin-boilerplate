-- Ensure admins can select all profiles via RLS

alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_admin_all'
  ) then
    create policy profiles_select_admin_all on public.profiles
      for select to authenticated
      using (public.is_admin());
  end if;
end $$;


