create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  bucket_id uuid references public.budget_buckets(id) on delete set null,
  priority text,
  target_amount numeric(14,2) not null check (target_amount >= 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  target_date date,
  completion_date date,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  amount numeric(14,2) not null check (amount >= 0),
  contributed_at date not null default current_date,
  allocation_id uuid references public.allocations(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_goals_user on public.goals(user_id);
create index idx_goal_contrib_goal on public.goal_contributions(goal_id);

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  amount numeric(14,2) not null check (amount >= 0),
  frequency text not null default 'monthly',
  due_date date,
  last_paid_date date,
  next_due date,
  status text not null default 'active',
  auto_create_expense boolean not null default false,
  account_id uuid references public.accounts(id) on delete set null,
  notes text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_name text not null,
  category text,
  plan text,
  cost numeric(14,2) not null check (cost >= 0),
  billing_cycle text not null default 'monthly',
  next_renewal_date date,
  status text not null default 'active',
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bills_user on public.bills(user_id);
create index idx_subs_user on public.subscriptions(user_id);
