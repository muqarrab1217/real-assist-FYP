# SQL Database Schema

This directory contains the cleanly structured, modular PostgreSQL schema for the Supabase backend.

## Execution Order

To properly initialize or recreate the database, execute the directories in this precise order:

1. `00_extensions.sql` - Installs any required database extensions.
2. `01_functions/` - Core functions like `handle_updated_at`, required by triggers and views later.
3. `02_tables/` - Core relational schema. Note: Tables MUST be created before anything else that references them (e.g. `profiles` must exist before `teams`, etc). Tables also enable RLS (`ENABLE ROW LEVEL SECURITY`) directly inline right after table creation.
4. `03_rls/` - Row Level Security policies. These enforce authorization per table. Policies are kept separate for readability.
5. `04_triggers/` - Database triggers. These must be executed AFTER the corresponding tables and functions (`01_functions`) exist. This binds the behavior. Includes Supabase Auth triggers.
6. `05_views/` - Relational views that aggregate data across tables (must run after tables).
7. `06_migrations/` - Pending schema alterations or post-schema fixes like `ALTER TABLE`.

## Notes on Supabase RLS and Auth Triggers

*   **Supabase Auth**: The `auth.users` table is managed by Supabase natively. We use a trigger `on_auth_user_created` (in `04_triggers`) bound to the `handle_new_user` function (in `01_functions`) to automatically sync external auth signups into our local `public.profiles` table.
*   **Row Level Security (RLS)**: Crucial for Supabase because the frontend accesses the database directly. If RLS is not enabled on a table, all queries will either be blocked or globally permitted depending on version defaults. We enable RLS in `02_tables` and apply specific policies in `03_rls`.
