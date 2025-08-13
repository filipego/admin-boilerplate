-- Permissions and role_permissions tables

create table if not exists public.permissions (
	key text primary key,
	label text not null
);

create table if not exists public.role_permissions (
	role text not null,
	permission_key text not null references public.permissions(key) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (role, permission_key)
);

-- Seed a few common permissions
insert into public.permissions (key, label) values
  ('users.read', 'Read users'),
  ('users.edit', 'Edit users'),
  ('reports.view', 'View reports'),
  ('settings.manage', 'Manage settings')
on conflict (key) do nothing;

-- Give admin all permissions by default
insert into public.role_permissions (role, permission_key)
select 'admin' as role, p.key
from public.permissions p
on conflict do nothing;

-- RLS: Only admins can modify, everyone authenticated can read
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- Helper: is current user admin
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- permissions policies
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='permissions' and policyname='permissions_select_all_auth') then
    create policy permissions_select_all_auth on public.permissions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='permissions' and policyname='permissions_admin_modify') then
    create policy permissions_admin_modify on public.permissions for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- role_permissions policies
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='role_permissions' and policyname='role_permissions_select_all_auth') then
    create policy role_permissions_select_all_auth on public.role_permissions for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='role_permissions' and policyname='role_permissions_admin_modify') then
    create policy role_permissions_admin_modify on public.role_permissions for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;


