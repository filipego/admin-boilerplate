-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Profiles table stores user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maintain updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

-- When a new auth user is created, insert into profiles
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS policies
alter table public.profiles enable row level security;

drop policy if exists "Public read own profile" on public.profiles;
create policy "Public read own profile" on public.profiles
for select using ( auth.uid() = id );

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
for update using ( auth.uid() = id );

-- Helper RPC to resolve username -> email for login
create or replace function public.get_email_for_username(p_username text)
returns text language sql stable security definer set search_path = public as $$
  select email from public.profiles where username = p_username limit 1;
$$;

revoke all on function public.get_email_for_username(text) from anon, authenticated, public;
grant execute on function public.get_email_for_username(text) to anon, authenticated;


