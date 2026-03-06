-- Run this in Supabase Dashboard > SQL Editor

-- Profiles: extends auth.users with role
create table profiles (
  id       uuid references auth.users(id) on delete cascade primary key,
  role     text not null check (role in ('admin','teacher')),
  teacher_id uuid  -- FK to teachers (only for role=teacher)
);
alter table profiles enable row level security;
create policy "own profile" on profiles for select using (auth.uid() = id);

-- Teachers
create table teachers (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  subjects text[] not null default '{}',
  color    text not null,
  email    text unique
);
alter table teachers enable row level security;
create policy "authenticated read" on teachers for select to authenticated using (true);
create policy "admin write" on teachers for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- Grades
create table grades (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  section text not null,
  label   text not null
);
alter table grades enable row level security;
create policy "authenticated read" on grades for select to authenticated using (true);
create policy "admin write" on grades for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- Assignments
create table assignments (
  id         uuid primary key default gen_random_uuid(),
  grade_id   uuid references grades(id) on delete cascade,
  slot_id    text not null,
  day        text not null check (day in ('lunes','martes','miercoles','jueves','viernes')),
  teacher_id uuid references teachers(id) on delete cascade,
  subject    text not null,
  unique (grade_id, slot_id, day)
);
alter table assignments enable row level security;
create policy "authenticated read" on assignments for select to authenticated using (true);
create policy "admin write" on assignments for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- Subject limits
create table subject_limits (
  id          uuid primary key default gen_random_uuid(),
  grade_id    uuid references grades(id) on delete cascade,
  subject     text not null,
  limit_hours integer not null check (limit_hours >= 0),
  unique (grade_id, subject)
);
alter table subject_limits enable row level security;
create policy "authenticated read" on subject_limits for select to authenticated using (true);
create policy "admin write" on subject_limits for all to authenticated
  using ((select role from profiles where id = auth.uid()) = 'admin');

-- After running above, create first admin:
-- 1. Create user in Supabase Auth Dashboard (Authentication > Users > Invite)
-- 2. Then run:
--    insert into profiles (id, role) values ('<user-uuid-from-auth>', 'admin');
