-- Add avatar_url column to profiles if missing
alter table public.profiles add column if not exists avatar_url text;

-- Create daily_decisions table for daily financial check-ins
create table if not exists public.daily_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  decision_date date not null,
  had_income boolean not null default false,
  had_expenses boolean not null default false,
  created_goal boolean not null default false,
  primary_action text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, decision_date)
);

create index if not exists idx_daily_decisions_user_date on public.daily_decisions(user_id, decision_date);

-- Enable RLS
alter table public.daily_decisions enable row level security;

-- RLS Policies for daily_decisions
create policy "Users can view their own daily decisions"
  on public.daily_decisions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily decisions"
  on public.daily_decisions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily decisions"
  on public.daily_decisions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own daily decisions"
  on public.daily_decisions for delete
  using (auth.uid() = user_id);
