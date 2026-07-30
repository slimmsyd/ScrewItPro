-- Slice 2.6: Fix profiles_update_own recursion landmine.
--
-- Old WITH CHECK subqueries on profiles work today (select policy doesn't join
-- profiles), but adding "admin can read all profiles" would create a cycle.
-- New model: ownership only on policy; pin privileged columns via trigger;
-- revoke direct updates to role/status/points_balance from authenticated.
--
-- Service role bypasses RLS but NOT this trigger — use set_config escape for
-- legitimate admin role changes:
--   select set_config('app.allow_profile_privilege_update', 'true', true);
--   update profiles set role = 'admin' where id = '…';

-- 1) Simplified RLS update policy (ownership only)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2) Admin can SELECT all profiles (needed for ops) — safe now that update
--    policy no longer subqueries profiles.
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role = 'admin' and me.status = 'active'
    )
  );

-- Wait — profiles_select_admin still self-joins profiles. Prefer a security
-- definer helper to break recursion (ARCHITECTURE-PLAN pattern).

drop policy if exists "profiles_select_admin" on public.profiles;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- 3) Pin privileged columns unless session escape is set
create or replace function public.profiles_pin_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.allow_profile_privilege_update', true) = 'true' then
    return new;
  end if;
  new.role := old.role;
  new.status := old.status;
  new.points_balance := old.points_balance;
  return new;
end;
$$;

drop trigger if exists profiles_pin_privileged on public.profiles;
create trigger profiles_pin_privileged
  before update on public.profiles
  for each row
  execute function public.profiles_pin_privileged_columns();

-- 4) Column-level revoke (defense in depth; trigger remains primary)
-- Note: Postgres may not support partial column revoke on all hosts; trigger is load-bearing.
do $$
begin
  revoke update (role, status, points_balance) on public.profiles from authenticated;
exception
  when undefined_object then null;
  when others then null;
end $$;

comment on function public.is_admin() is
  'SECURITY DEFINER role check for RLS — avoids profiles policy recursion.';
