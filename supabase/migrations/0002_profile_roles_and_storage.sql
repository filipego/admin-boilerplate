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

-- Create storage bucket 'avatars' if it doesn't exist (set public true)
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
on conflict (id) do nothing;

-- Storage policies for avatars
-- Allow public read
do $$ begin
  begin
    create policy "avatars read public" on storage.objects
    for select using ( bucket_id = 'avatars' );
  exception when duplicate_object then null; end;
end $$;

-- Allow authenticated users to insert/update/delete only their folder avatars/{uid}/...
-- Insert/update/delete only in own folder avatars/{uid}/...
do $$ begin
  begin
    create policy "avatars insert own" on storage.objects
    for insert to authenticated
    with check ( bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text );
  exception when duplicate_object then null; end;
end $$;

do $$ begin
  begin
    create policy "avatars update own" on storage.objects
    for update to authenticated
    using ( bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text )
    with check ( bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text );
  exception when duplicate_object then null; end;
end $$;

do $$ begin
  begin
    create policy "avatars delete own" on storage.objects
    for delete to authenticated
    using ( bucket_id = 'avatars' and split_part(name, '/', 1) = auth.uid()::text );
  exception when duplicate_object then null; end;
end $$;


