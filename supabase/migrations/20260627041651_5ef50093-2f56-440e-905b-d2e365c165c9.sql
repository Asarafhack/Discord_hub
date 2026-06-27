
-- Roles
create type public.app_role as enum ('admin','member');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Auto profile + first user becomes admin
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  if (select count(*) from public.user_roles where role='admin') = 0 then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles(user_id, role) values (new.id, 'member');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Guild configurations (a connected Discord server)
create table public.guild_configs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  guild_id text not null,
  guild_name text,
  primary_channel_id text,
  mirror_webhook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, guild_id)
);
grant select, insert, update, delete on public.guild_configs to authenticated;
grant all on public.guild_configs to service_role;
alter table public.guild_configs enable row level security;
create policy "own guilds" on public.guild_configs for all to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Slash command configuration (per workspace)
create table public.slash_commands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  enabled boolean not null default true,
  response_template text not null default 'OK',
  mirror_on_run boolean not null default true,
  ai_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.slash_commands to authenticated, anon;
grant insert, update, delete on public.slash_commands to authenticated;
grant all on public.slash_commands to service_role;
alter table public.slash_commands enable row level security;
create policy "anyone reads commands" on public.slash_commands for select using (true);
create policy "admins manage commands" on public.slash_commands for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.slash_commands(name,description,response_template,ai_enabled,mirror_on_run) values
('report','Submit a bug, issue, or incident report','Report received. Ref #{id}', true, true),
('status','Check live system status','All systems operational.', false, false);

-- Interactions log (dedup by discord interaction id)
create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  interaction_id text not null unique,
  guild_id text,
  channel_id text,
  user_tag text,
  user_id text,
  command_name text not null,
  command_text text,
  ai_summary text,
  ai_tag text,
  status text not null default 'success',
  mirrored boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);
grant select on public.interactions to authenticated;
grant all on public.interactions to service_role;
alter table public.interactions enable row level security;
create policy "auth reads interactions" on public.interactions for select to authenticated using (true);

-- Audit log
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target text,
  meta jsonb,
  ip text,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "admins read audit" on public.audit_log for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "auth insert audit" on public.audit_log for insert to authenticated with check (auth.uid() = actor_id);

-- Realtime
alter publication supabase_realtime add table public.interactions;
alter publication supabase_realtime add table public.slash_commands;
