-- =====================================================================
-- Migration 001: projects, owner role, notifications, admin requests,
--                support chat.
--
-- Run this ONCE in the Supabase SQL Editor if your database was created
-- with the older schema.sql (users / bugs / comments / bug_history only).
-- It keeps all existing data:
--   * creates a project called "Default Project"
--   * moves every existing user and bug into it
--   * prints that project's invite code at the end
--
-- Safe to re-run: every step checks whether it was already done.
-- =====================================================================

create extension if not exists "pgcrypto";

-- 1. projects -----------------------------------------------------------
create table if not exists projects (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    invite_code text not null unique,
    created_by  uuid references users (id) on delete set null,
    created_at  timestamptz not null default now()
);

-- 2. users: owner role, project, email preference -------------------------
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('owner', 'admin', 'tester', 'developer'));
alter table users add column if not exists project_id uuid references projects (id) on delete set null;
alter table users add column if not exists email_notifications boolean not null default true;
create index if not exists idx_users_project on users (project_id);

-- 3. bugs: project ------------------------------------------------------
alter table bugs add column if not exists project_id uuid references projects (id) on delete cascade;
create index if not exists idx_bugs_project on bugs (project_id);

-- 4. Move existing data into a default project ------------------------------
do $$
declare
    default_project uuid;
    first_admin uuid;
begin
    if exists (select 1 from bugs where project_id is null)
       or exists (select 1 from users where project_id is null and role <> 'owner') then
        select id into first_admin from users where role = 'admin' order by created_at limit 1;
        insert into projects (name, invite_code, created_by)
        values ('Default Project', 'BUG-' || upper(substr(md5(random()::text), 1, 6)), first_admin)
        returning id into default_project;

        update users set project_id = default_project where project_id is null and role <> 'owner';
        update bugs set project_id = default_project where project_id is null;
    end if;
end $$;

alter table bugs alter column project_id set not null;

-- 5. New tables -------------------------------------------------------------
create table if not exists notifications (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references users (id) on delete cascade,
    bug_id     uuid references bugs (id) on delete cascade,
    type       text not null,
    message    text not null,
    link       text,
    is_read    boolean not null default false,
    created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications (user_id, created_at desc);

create table if not exists admin_requests (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users (id) on delete cascade,
    reason      text not null,
    status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_by uuid references users (id) on delete set null,
    reviewed_at timestamptz,
    created_at  timestamptz not null default now()
);
create index if not exists idx_admin_requests_status on admin_requests (status);

create table if not exists faqs (
    id         uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects (id) on delete cascade,
    question   text not null,
    answer     text not null,
    keywords   text not null default '',
    hits       integer not null default 0,
    created_at timestamptz not null default now()
);
create index if not exists idx_faqs_project on faqs (project_id);

create table if not exists support_questions (
    id          uuid primary key default gen_random_uuid(),
    project_id  uuid not null references projects (id) on delete cascade,
    user_id     uuid not null references users (id) on delete cascade,
    question    text not null,
    answer      text,
    status      text not null default 'open' check (status in ('open', 'answered')),
    answered_by uuid references users (id) on delete set null,
    answered_at timestamptz,
    created_at  timestamptz not null default now()
);
create index if not exists idx_support_questions_project on support_questions (project_id, status);

-- 6. Lock new tables to the backend (same as the existing ones) ---------------
alter table projects enable row level security;
alter table notifications enable row level security;
alter table admin_requests enable row level security;
alter table faqs enable row level security;
alter table support_questions enable row level security;

-- 7. Make yourself (and your team) owners - edit the emails, then run: ---------
-- update users set role = 'owner', project_id = null where email in ('you@example.com');

-- 8. Show the invite code of the default project ------------------------------
select name, invite_code from projects order by created_at;

-- Note: the Default Project has no FAQs yet. Its admin can add them on the
-- Help Center page (new projects get a starter set automatically).
