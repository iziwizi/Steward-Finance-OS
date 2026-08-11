alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.budget_buckets enable row level security;
alter table public.income_transactions enable row level security;
alter table public.allocations enable row level security;
alter table public.expense_transactions enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.bills enable row level security;
alter table public.subscriptions enable row level security;
alter table public.assets enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.financial_journal_entries enable row level security;
alter table public.monthly_reviews enable row level security;
alter table public.notification_log enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "accounts_owner" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "buckets_owner" on public.budget_buckets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "income_owner" on public.income_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "allocations_owner" on public.allocations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expense_owner" on public.expense_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_owner" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goal_contrib_owner" on public.goal_contributions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bills_owner" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subs_owner" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "assets_owner" on public.assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist_owner" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "journal_owner" on public.financial_journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "monthly_review_owner" on public.monthly_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notif_log_owner" on public.notification_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
