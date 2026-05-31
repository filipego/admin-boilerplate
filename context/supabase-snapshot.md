# Supabase Snapshot

Captured on 2026-05-31 using local environment inspection, Supabase MCP access checks, and the Supabase CLI.

## Remote Project

- Project ID / ref from local `.env.local`: `bwlskocvvspbaltihfvo`
- Database host from local `.env.local`: `bwlskocvvspbaltihfvo.supabase.co`
- MCP access for this project currently fails with: `You do not have permission to perform this action`.

## MCP Snapshot

- The connected Supabase MCP account currently lists only project `wrvsjmdkyrjesvydujdt`, which is not the project used by this boilerplate.
- Calls to list migrations, extensions, Edge Functions, and branches for `bwlskocvvspbaltihfvo` all failed with a permission error.
- No remote migrations or schema changes were applied through MCP.

## CLI Snapshot

- Supabase CLI linking succeeds for project `bwlskocvvspbaltihfvo`.
- Remote data snapshot includes only the auth/profile tables needed for local login parity:
  - `auth.users`
  - `auth.identities`
  - `public.profiles`
  - `public.permissions`
  - `public.role_permissions`
- Local import excludes active sessions, refresh tokens, audit entries, one-time tokens, OAuth, MFA, SSO, SAML, and WebAuthn data.
- Snapshot SQL files are stored in ignored `supabase/.snapshots/` and must not be committed.

## Local Development

- Supabase CLI is available through `npm exec supabase` at version `2.102.0`.
- Local Supabase config has been initialized in `supabase/config.toml`.
- Docker Desktop is installed and running.
- Local Supabase started successfully, migrations applied successfully, and local auth/profile data now matches the production users/profiles/permissions snapshot while retaining the local hardening migration.
