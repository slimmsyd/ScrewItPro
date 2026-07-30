-- Refer & Earn Points: opaque per-user codes + attribution ledger.
--
-- Points unit of record remains profiles.points_balance + point_ledger
-- (apply_points). Dollar conversion is a future redemption layer.
--
-- Product rules (v1):
--   - Award on friend's first signup (both sides)
--   - Opaque codes (SIP + base32), not vanity usernames
--   - referred_by / referral_code client-immutable (pin trigger)

-- -----------------------------------------------------------------------------
-- profiles: referral_code + referred_by
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

comment on column public.profiles.referral_code is
  'Opaque personal referral code (e.g. SIP7K2M9A). Lazy-assigned; unique when set.';
comment on column public.profiles.referred_by is
  'Set once when this user signed up via another member''s link. Immutable after set.';

create unique index if not exists profiles_referral_code_uidx
  on public.profiles (referral_code)
  where referral_code is not null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

-- Pin referral_code + referred_by with the existing privilege pin trigger
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
  -- Once set, referral identity fields cannot be client-mutated
  new.referral_code := old.referral_code;
  new.referred_by := old.referred_by;
  return new;
end;
$$;

-- Service-role path still needs to SET referral_code / referred_by via escape.
-- claimReferral and ensureUserReferralCode use set_config before updates.

do $$
begin
  revoke update (role, status, points_balance, referral_code, referred_by)
    on public.profiles from authenticated;
exception
  when undefined_object then null;
  when others then null;
end $$;

-- -----------------------------------------------------------------------------
-- referral_attributions: one completed referral per referee
-- -----------------------------------------------------------------------------

create table if not exists public.referral_attributions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referee_id uuid not null references public.profiles (id) on delete cascade,
  code_used text not null,
  referrer_points integer not null
    check (referrer_points >= 0),
  referee_points integer not null
    check (referee_points >= 0),
  created_at timestamptz not null default now(),
  constraint referral_attributions_referee_unique unique (referee_id),
  constraint referral_attributions_no_self check (referrer_id <> referee_id)
);

create index if not exists referral_attributions_referrer_id_created_at_idx
  on public.referral_attributions (referrer_id, created_at desc);

comment on table public.referral_attributions is
  'Successful referred signups. Source of truth for Referrals Recent list. Points also written to point_ledger.';

alter table public.referral_attributions enable row level security;

-- Members can read attributions they are part of (as referrer or referee)
drop policy if exists "referral_attributions_select_own" on public.referral_attributions;
create policy "referral_attributions_select_own"
  on public.referral_attributions for select
  to authenticated
  using (
    auth.uid() = referrer_id
    or auth.uid() = referee_id
  );

-- No insert/update/delete policies for authenticated — service role only.

-- -----------------------------------------------------------------------------
-- claim_referral: atomic attribution + points (security definer)
-- -----------------------------------------------------------------------------

create or replace function public.claim_referral(
  p_referee_id uuid,
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_referrer public.profiles%rowtype;
  v_referee public.profiles%rowtype;
  v_attr_id uuid;
  v_referrer_pts integer := 500;
  v_referee_pts integer := 200;
begin
  v_code := upper(trim(p_code));
  if v_code is null or length(v_code) < 4 then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  select * into v_referee from public.profiles where id = p_referee_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'referee_not_found');
  end if;

  if v_referee.referred_by is not null then
    return jsonb_build_object('ok', false, 'error', 'already_attributed');
  end if;

  if exists (
    select 1 from public.referral_attributions where referee_id = p_referee_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_attributed');
  end if;

  select * into v_referrer
  from public.profiles
  where referral_code = v_code
  for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'code_not_found');
  end if;

  if v_referrer.id = p_referee_id then
    return jsonb_build_object('ok', false, 'error', 'self_referral');
  end if;

  if v_referrer.status is distinct from 'active' then
    return jsonb_build_object('ok', false, 'error', 'referrer_inactive');
  end if;

  -- Allow privilege pin escape for this transaction
  perform set_config('app.allow_profile_privilege_update', 'true', true);

  insert into public.referral_attributions (
    referrer_id, referee_id, code_used, referrer_points, referee_points
  )
  values (
    v_referrer.id, p_referee_id, v_code, v_referrer_pts, v_referee_pts
  )
  returning id into v_attr_id;

  update public.profiles
  set referred_by = v_referrer.id
  where id = p_referee_id;

  -- Award points via existing ledger function
  perform public.apply_points(
    v_referrer.id,
    v_referrer_pts,
    'referral'::public.point_reason,
    'referral_attribution',
    v_attr_id,
    'Referral signup bonus (referrer)',
    null
  );

  perform public.apply_points(
    p_referee_id,
    v_referee_pts,
    'signup_bonus'::public.point_reason,
    'referral_attribution',
    v_attr_id,
    'Welcome points via referral link',
    null
  );

  return jsonb_build_object(
    'ok', true,
    'attributionId', v_attr_id,
    'referrerId', v_referrer.id,
    'referrerPoints', v_referrer_pts,
    'refereePoints', v_referee_pts
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'already_attributed');
end;
$$;

revoke all on function public.claim_referral(uuid, text) from public;
-- Only callable via service role / postgres; Next.js uses admin client.
grant execute on function public.claim_referral(uuid, text) to service_role;

comment on function public.claim_referral(uuid, text) is
  'Atomic first-signup referral claim: attribution row + dual apply_points. Idempotent on already_attributed.';

-- -----------------------------------------------------------------------------
-- ensure_referral_code: assign opaque code once (service role)
-- -----------------------------------------------------------------------------

create or replace function public.ensure_referral_code(
  p_user_id uuid,
  p_code text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing text;
  v_code text;
begin
  v_code := upper(trim(p_code));
  if v_code is null or length(v_code) < 6 then
    raise exception 'invalid referral code';
  end if;

  select referral_code into v_existing
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'profile % not found', p_user_id;
  end if;

  if v_existing is not null and length(v_existing) > 0 then
    return v_existing;
  end if;

  perform set_config('app.allow_profile_privilege_update', 'true', true);

  update public.profiles
  set referral_code = v_code
  where id = p_user_id
    and referral_code is null;

  select referral_code into v_existing
  from public.profiles
  where id = p_user_id;

  return v_existing;
exception
  when unique_violation then
    -- Race: another writer took this code; caller retries with a new code
    select referral_code into v_existing from public.profiles where id = p_user_id;
    if v_existing is not null then
      return v_existing;
    end if;
    raise;
end;
$$;

revoke all on function public.ensure_referral_code(uuid, text) from public;
grant execute on function public.ensure_referral_code(uuid, text) to service_role;

comment on function public.ensure_referral_code(uuid, text) is
  'Assign opaque referral_code once. Escapes privilege pin. Idempotent if already set.';
