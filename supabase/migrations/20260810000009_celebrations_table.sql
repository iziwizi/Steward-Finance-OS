create table public.celebrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'first_income','first_expense','goal_milestone','goal_completed','tithe_paid','positive_cash_flow'
  title text not null,
  message text not null,
  related_entity text not null default '', -- free-form reference (goal id, allocation id, etc.), for de-duplication
  seen_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.celebrations enable row level security;
create policy "celebrations_owner" on public.celebrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_celebrations_user on public.celebrations(user_id, created_at desc);

-- Prevent the same milestone firing twice (e.g. goal hitting 50% re-saved at 51%).
create unique index idx_celebrations_dedupe on public.celebrations(user_id, type, related_entity);
