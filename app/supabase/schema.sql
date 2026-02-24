-- ============================================================
-- PawDays - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- ── Profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  emergency_contact text,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Pets ──────────────────────────────────────────────────
create table if not exists pets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  species     text not null check (species in ('dog', 'cat', 'bird', 'rabbit', 'other')),
  breed       text,
  age         integer check (age >= 0 and age <= 50),
  weight_lbs  numeric(5,1) check (weight_lbs > 0),
  notes       text,
  photo_url   text,
  created_at  timestamptz default now()
);

alter table pets enable row level security;

create policy "Users manage own pets"
  on pets for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index on pets (owner_id);


-- ── Available Days ─────────────────────────────────────────
create table if not exists available_days (
  id              uuid primary key default gen_random_uuid(),
  date            date not null unique,
  max_capacity    integer not null default 10,
  slots_remaining integer not null default 10,
  constraint slots_check check (slots_remaining >= 0 and slots_remaining <= max_capacity)
);

alter table available_days enable row level security;

-- Everyone (authenticated) can read available days
create policy "Authenticated users can view available days"
  on available_days for select using (auth.role() = 'authenticated');

-- Only service role / admin can insert/update available days
create policy "Service role manages available days"
  on available_days for all using (auth.role() = 'service_role');

-- Seed some available days for testing (next 30 weekdays)
insert into available_days (date, max_capacity, slots_remaining)
select
  gs::date,
  10,
  10
from generate_series(
  current_date + interval '1 day',
  current_date + interval '60 days',
  '1 day'::interval
) gs
where extract(dow from gs) not in (0, 6)  -- exclude weekends
on conflict (date) do nothing;


-- ── Bookings ──────────────────────────────────────────────
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid not null references pets(id) on delete cascade,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  day_id      uuid not null references available_days(id),
  status      text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  created_at  timestamptz default now(),
  unique (pet_id, day_id)
);

alter table bookings enable row level security;

create policy "Users manage own bookings"
  on bookings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index on bookings (owner_id);
create index on bookings (pet_id);
create index on bookings (day_id);
create index on bookings (status);
