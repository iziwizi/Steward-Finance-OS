-- In-app notification center (bell icon) — persisted so it survives across sessions/devices.
create table public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'pending_allocation','bill_due','subscription_renewal','budget_warning','goal_milestone','daily_brief','weekly_report','monthly_report'
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.in_app_notifications enable row level security;
create policy "in_app_notif_owner" on public.in_app_notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_in_app_notif_user on public.in_app_notifications(user_id, read_at);

-- Web Push subscriptions (one browser/device per row) for real OS-level push notifications.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "push_sub_owner" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_push_sub_user on public.push_subscriptions(user_id);
