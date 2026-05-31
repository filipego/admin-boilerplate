-- Prevent normal authenticated clients from escalating privileges through profile self-updates.
-- Service-role server handlers can still manage profile roles explicitly.

revoke update on table public.profiles from anon, authenticated;
grant update (username, avatar_url) on table public.profiles to authenticated;
