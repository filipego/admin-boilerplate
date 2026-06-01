# Local Supabase Development

Use this workflow to test auth and database changes before applying anything to production.

## Prerequisites

1. Docker Desktop must be installed and running.
2. Supabase CLI is installed as a project dev dependency.
3. The CLI must be logged in to the Supabase account that owns your Supabase project before remote link/pull/push commands.

## Commands

```bash
npm run supabase:login
npm run supabase:link
npm run supabase:start
npm run supabase:status
```

`npm run supabase:link` runs `supabase link` interactively. For non-interactive linking, pass your own project reference without committing it:

```bash
npm run supabase:link -- --project-ref your-project-ref
```

`supabase:status` prints local environment values. Copy those values into `.env.local` when testing locally. Use `supabase/local.env.example` as the template.

After changing migrations, reset the local database:

```bash
npm run supabase:reset
```

Then run the app:

```bash
npm run dev:local
```

## Current Blockers

- Docker Desktop was installed manually from the downloaded Docker app bundle because the Homebrew cask requires an interactive sudo password for CLI symlinks.
- Docker CLI is available at `/Applications/Docker.app/Contents/Resources/bin/docker`; it is not currently linked into the shell `PATH`.
- The MCP tools may still show a global Supabase connector that does not have access to your linked project.

## Production-like Local Data

- Local auth/profile data can be synced from your linked Supabase project through the Supabase CLI, not the currently connected global MCP account.
- Snapshot files live under `supabase/.snapshots/`, which is gitignored because auth dumps include sensitive user data such as password hashes.
- The local import intentionally includes only `auth.users`, `auth.identities`, `public.profiles`, `public.permissions`, and `public.role_permissions`.
- Session, refresh token, audit, OAuth, MFA, SSO, SAML, and WebAuthn tables are excluded from local imports.
- Production users keep their existing password hashes locally, so existing credentials should work against the local Supabase stack.

Refresh the local production-like auth data after the CLI is linked:

```bash
npm exec supabase -- db dump --linked --data-only --use-copy --schema auth,public \
  -x auth.audit_log_entries,auth.flow_state,auth.sessions,auth.refresh_tokens,auth.mfa_amr_claims,auth.mfa_challenges,auth.mfa_factors,auth.one_time_tokens,auth.oauth_authorizations,auth.oauth_client_states,auth.oauth_clients,auth.oauth_consents,auth.custom_oauth_providers,auth.instances,auth.saml_providers,auth.saml_relay_states,auth.sso_domains,auth.sso_providers,auth.webauthn_challenges,auth.webauthn_credentials,auth.schema_migrations \
  --file supabase/.snapshots/production-users-profiles-only.sql
```

Reset local Supabase before import so the hardened local migrations are applied first:

```bash
npm run supabase:reset
```

Then import the snapshot with Docker's bundled CLI:

```bash
printf '%s\n' "truncate table auth.identities, auth.users, public.profiles, public.role_permissions, public.permissions cascade;" \
  | /Applications/Docker.app/Contents/Resources/bin/docker exec -i supabase_db_admin-boilerplate psql -v ON_ERROR_STOP=1 -U postgres -d postgres

/Applications/Docker.app/Contents/Resources/bin/docker exec -i supabase_db_admin-boilerplate psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < supabase/.snapshots/production-users-profiles-only.sql
```
