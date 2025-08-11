-- Add role to profiles (admin | client)
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    alter table public.profiles add column role text not null default 'client' check (role in ('admin','client'));
    create index if not exists idx_profiles_username on public.profiles (username);
  end if;
end $$;

-- Admin can select/update any profile
drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles" on public.profiles
for select using ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

drop policy if exists "Admin update any profile" on public.profiles;
create policy "Admin update any profile" on public.profiles
for update using ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

-- Create storage bucket 'avatars' if it doesn't exist and set to public
do $$
begin
  perform 1 from storage.buckets where id = 'avatars';
  if not found then
    perform storage.create_bucket('avatars', public => true);
  end if;
end $$;

-- Storage policies for avatars
-- Allow public read
do $$ begin
  begin
    create policy "Public read avatars" on storage.objects
    for select using ( bucket_id = 'avatars' );
  exception when duplicate_object then null; end;
end $$;

-- Allow authenticated users to insert/update/delete only their folder avatars/{uid}/...
do $$ begin
  begin
    create policy "Users manage own avatars" on storage.objects
    for all using (
      bucket_id = 'avatars' and (auth.uid()::text = (regexp_matches(name, '^([^/]+)/'))[1])
    ) with check (
      bucket_id = 'avatars' and (auth.uid()::text = (regexp_matches(name, '^([^/]+)/'))[1])
    );
  exception when duplicate_object then null; end;
end $$;


