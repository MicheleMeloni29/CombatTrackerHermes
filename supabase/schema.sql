-- Schema applicato al progetto Supabase del Combat Tracker.
-- Le policy RLS isolano tutti i dati per auth.uid().

create table public.saved_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  max_hp integer not null check (max_hp between 1 and 1000000),
  initiative integer not null default 0 check (initiative between 0 and 1000000),
  is_monster boolean not null default false,
  icon text not null default '⚔️' check (char_length(icon) between 1 and 32),
  memorized_spells jsonb not null default '[]'::jsonb
    check (jsonb_typeof(memorized_spells) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_characters_user_name_kind_hp_key
    unique (user_id, name, is_monster, max_hp)
);

create table public.combat_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  snapshot jsonb not null
    check (
      jsonb_typeof(snapshot) = 'object'
      and jsonb_typeof(snapshot -> 'characters') = 'array'
      and jsonb_typeof(snapshot -> 'log') = 'array'
      and jsonb_typeof(snapshot -> 'currentTurnIndex') = 'number'
      and jsonb_typeof(snapshot -> 'round') = 'number'
      and jsonb_typeof(snapshot -> 'isCombatStarted') = 'boolean'
    ),
  saved_at bigint not null
    default floor(extract(epoch from clock_timestamp()) * 1000)::bigint,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_autosaved_at timestamptz
);

create index saved_characters_user_updated_idx
  on public.saved_characters (user_id, updated_at desc);

create index combat_saves_user_saved_idx
  on public.combat_saves (user_id, saved_at desc);

create unique index combat_saves_one_active_per_user_idx
  on public.combat_saves (user_id)
  where is_active;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create trigger saved_characters_set_updated_at
before update on public.saved_characters
for each row execute function public.set_updated_at();

create trigger combat_saves_set_updated_at
before update on public.combat_saves
for each row execute function public.set_updated_at();

alter table public.saved_characters enable row level security;
alter table public.combat_saves enable row level security;

revoke all on table public.saved_characters from anon;
revoke all on table public.combat_saves from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.saved_characters to authenticated;
grant select, insert, update, delete on table public.combat_saves to authenticated;

create policy "saved_characters_select_own"
on public.saved_characters for select to authenticated
using ((select auth.uid()) = user_id);

create policy "saved_characters_insert_own"
on public.saved_characters for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "saved_characters_update_own"
on public.saved_characters for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "saved_characters_delete_own"
on public.saved_characters for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "combat_saves_select_own"
on public.combat_saves for select to authenticated
using ((select auth.uid()) = user_id);

create policy "combat_saves_insert_own"
on public.combat_saves for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "combat_saves_update_own"
on public.combat_saves for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "combat_saves_delete_own"
on public.combat_saves for delete to authenticated
using ((select auth.uid()) = user_id);
