create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  purchase_date date,
  purchase_price numeric(14,2),
  current_value numeric(14,2),
  quantity numeric(10,2) not null default 1,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  category text,
  estimated_cost numeric(14,2),
  priority text,
  date_added date not null default current_date,
  url text,
  notes text,
  moved_to_goal boolean not null default false,
  goal_id uuid references public.goals(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.financial_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  did_well text,
  mistakes text,
  surprises text,
  improve_next_month text,
  grateful_for text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_income numeric(14,2),
  total_expenses numeric(14,2),
  total_allocated numeric(14,2),
  total_sent numeric(14,2),
  total_pending numeric(14,2),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, period_start, period_end)
);

create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  period_key text not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent',
  unique (user_id, notification_type, period_key)
);

create index idx_assets_user on public.assets(user_id);
create index idx_wishlist_user on public.wishlist_items(user_id);
create index idx_journal_user_date on public.financial_journal_entries(user_id, entry_date);
create index idx_monthly_review_user on public.monthly_reviews(user_id);
create index idx_notif_log_user on public.notification_log(user_id);
