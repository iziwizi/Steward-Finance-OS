create table public.income_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  txn_date date not null,
  source text not null,
  account_id uuid references public.accounts(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  income_transaction_id uuid not null references public.income_transactions(id) on delete cascade,
  bucket_id uuid not null references public.budget_buckets(id) on delete restrict,
  planned_amount numeric(14,2) not null check (planned_amount >= 0),
  status text not null default 'pending' check (status in ('pending','sent')),
  sent_at timestamptz,
  sent_account_id uuid references public.accounts(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (income_transaction_id, bucket_id)
);

create table public.expense_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  txn_date date not null,
  bucket_id uuid references public.budget_buckets(id) on delete set null,
  reason text,
  vendor text,
  payment_account_id uuid references public.accounts(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  description text,
  receipt_status text not null default 'unpaid' check (receipt_status in ('paid','unpaid','na')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_income_user_date on public.income_transactions(user_id, txn_date);
create index idx_alloc_user on public.allocations(user_id);
create index idx_alloc_income on public.allocations(income_transaction_id);
create index idx_alloc_bucket on public.allocations(bucket_id);
create index idx_alloc_status on public.allocations(status);
create index idx_expense_user_date on public.expense_transactions(user_id, txn_date);
create index idx_expense_bucket on public.expense_transactions(bucket_id);
