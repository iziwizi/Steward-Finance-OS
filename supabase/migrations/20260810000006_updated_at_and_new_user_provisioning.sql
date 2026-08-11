create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_accounts_updated before update on public.accounts
  for each row execute function public.set_updated_at();
create trigger trg_buckets_updated before update on public.budget_buckets
  for each row execute function public.set_updated_at();
create trigger trg_income_updated before update on public.income_transactions
  for each row execute function public.set_updated_at();
create trigger trg_alloc_updated before update on public.allocations
  for each row execute function public.set_updated_at();
create trigger trg_expense_updated before update on public.expense_transactions
  for each row execute function public.set_updated_at();
create trigger trg_goals_updated before update on public.goals
  for each row execute function public.set_updated_at();
create trigger trg_bills_updated before update on public.bills
  for each row execute function public.set_updated_at();
create trigger trg_subs_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger trg_assets_updated before update on public.assets
  for each row execute function public.set_updated_at();
create trigger trg_wishlist_updated before update on public.wishlist_items
  for each row execute function public.set_updated_at();
create trigger trg_journal_updated before update on public.financial_journal_entries
  for each row execute function public.set_updated_at();

-- Provision a new user with a profile + the StewardOS default accounts/buckets.
-- These are just starting defaults; every value is editable per-user afterward
-- (Phase 30 of the original brief: configurable rules, nothing hard-coded to one person).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_grey uuid;
  v_opay uuid;
  v_zenith uuid;
  v_piggyvest uuid;
  v_palmpay uuid;
  v_fcmb uuid;
begin
  insert into public.profiles (id, email, notification_email)
  values (new.id, new.email, new.email);

  insert into public.accounts (user_id, name, institution) values (new.id, 'Grey', 'Grey') returning id into v_grey;
  insert into public.accounts (user_id, name, institution) values (new.id, 'OPay', 'OPay') returning id into v_opay;
  insert into public.accounts (user_id, name, institution) values (new.id, 'Zenith', 'Zenith Bank') returning id into v_zenith;
  insert into public.accounts (user_id, name, institution) values (new.id, 'PiggyVest', 'PiggyVest') returning id into v_piggyvest;
  insert into public.accounts (user_id, name, institution) values (new.id, 'PalmPay', 'PalmPay') returning id into v_palmpay;
  insert into public.accounts (user_id, name, institution) values (new.id, 'FCMB Personal', 'FCMB') returning id into v_fcmb;

  insert into public.budget_buckets (user_id, name, purpose, target_percent, is_income_split, default_account_id, sort_order) values
    (new.id, 'Tithe', '10% of income', 10, true, v_grey, 1),
    (new.id, 'Living Expenses', 'Food, transport, data, utilities, medical', 50, true, v_opay, 2),
    (new.id, 'Future Martins', 'Books, certifications, gear, investments', 15, true, v_zenith, 3),
    (new.id, 'Freedom Fund', 'Emergency reserve', 10, true, v_piggyvest, 4),
    (new.id, 'Kingdom Giving', 'Partnership & ministry, Prophet personal seed', 8, true, v_palmpay, 5),
    (new.id, 'Mother', 'Support for Mum', 4, true, v_fcmb, 6),
    (new.id, 'Lifestyle', 'Clothes, shoes, haircut, grooming', 2, true, v_fcmb, 7),
    (new.id, 'Miscellaneous', 'Unexpected requests', 1, true, v_fcmb, 8),
    (new.id, 'Rent Fund', 'Apartment savings (goal-funded, not part of the income split)', 0, false, v_grey, 9);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
