-- Link waitlist leads to accounts when they create a Supabase Auth user.
-- Safe to re-run on DBs that already have foundation_schema.

alter table public.waitlist_entries
  add column if not exists converted_user_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'waitlist_entries_converted_user_id_fkey'
  ) then
    -- Only add FK if profiles exists (foundation schema)
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'profiles'
    ) then
      alter table public.waitlist_entries
        add constraint waitlist_entries_converted_user_id_fkey
        foreign key (converted_user_id)
        references public.profiles (id)
        on delete set null;
    end if;
  end if;
end $$;

create index if not exists waitlist_entries_converted_user_id_idx
  on public.waitlist_entries (converted_user_id);
