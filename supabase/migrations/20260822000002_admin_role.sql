-- Add role column to profiles for Super Admin capability
alter table public.profiles add column if not exists role text not null default 'user';

-- Check constraint on role
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'check_profile_role'
  ) then
    alter table public.profiles add constraint check_profile_role check (role in ('user', 'admin'));
  end if;
end $$;

-- Helper function to check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Secure RPC to list registered users for admin dashboard
create or replace function public.list_admin_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  updated_at timestamptz,
  onboarding_completed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Server-side security check
  if not public.is_admin() then
    raise exception 'Unauthorized: Super Admin access required.';
  end if;

  return query
  select
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at,
    p.onboarding_completed_at
  from public.profiles p
  order by p.created_at desc;
end;
$$;

-- Allow admins to update user role
create or replace function public.set_user_role(target_user_id uuid, target_role text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Super Admin access required.';
  end if;

  if target_role not in ('user', 'admin') then
    raise exception 'Invalid role.';
  end if;

  update public.profiles
  set role = target_role, updated_at = now()
  where id = target_user_id;

  return true;
end;
$$;
