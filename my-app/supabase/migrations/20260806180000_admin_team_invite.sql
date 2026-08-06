-- =============================================================================
-- Admin team invite — privilege escape RPCs for staff role/status.
--
-- profiles_pin_privileged_columns blocks role/status updates unless
-- app.allow_profile_privilege_update = 'true' (service role does NOT bypass).
-- =============================================================================

-- Set staff role + status (service_role only — called from Next.js admin APIs).
create or replace function public.admin_set_profile_staff(
  p_user_id uuid,
  p_role public.user_role,
  p_status public.profile_status default 'invited'
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.profiles;
begin
  if p_role not in ('admin', 'technician', 'driver') then
    raise exception 'invalid_staff_role';
  end if;

  if p_status not in ('invited', 'active', 'suspended') then
    raise exception 'invalid_status';
  end if;

  perform set_config('app.allow_profile_privilege_update', 'true', true);

  update public.profiles
  set
    role = p_role,
    status = p_status,
    updated_at = now()
  where id = p_user_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'profile_not_found';
  end if;

  return v_row;
end;
$$;

comment on function public.admin_set_profile_staff(uuid, public.user_role, public.profile_status) is
  'Service-role only: set staff role/status with privilege pin escape. Never callable by clients.';

revoke all on function public.admin_set_profile_staff(uuid, public.user_role, public.profile_status) from public;
grant execute on function public.admin_set_profile_staff(uuid, public.user_role, public.profile_status) to service_role;

-- First successful sign-in after invite: invited staff → active (own row only).
create or replace function public.activate_own_staff_invite()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_row
  from public.profiles
  where id = auth.uid();

  if v_row.id is null then
    raise exception 'profile_not_found';
  end if;

  -- Customers and already-active staff: no-op
  if v_row.role not in ('admin', 'technician', 'driver') then
    return v_row;
  end if;

  if v_row.status is distinct from 'invited' then
    return v_row;
  end if;

  perform set_config('app.allow_profile_privilege_update', 'true', true);

  update public.profiles
  set
    status = 'active',
    updated_at = now()
  where id = auth.uid()
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.activate_own_staff_invite() is
  'Authenticated user: if staff + invited, flip status to active on first login.';

revoke all on function public.activate_own_staff_invite() from public;
grant execute on function public.activate_own_staff_invite() to authenticated;
grant execute on function public.activate_own_staff_invite() to service_role;
