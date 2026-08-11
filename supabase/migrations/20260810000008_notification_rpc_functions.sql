-- All functions below are SECURITY DEFINER so the server-side cron route can
-- call them with just the public anon key (no service-role key ever needs to
-- leave Supabase / sit in Vercel env vars). Each function is narrowly scoped
-- to notification/digest concerns only.

create or replace function public.list_users_for_notifications()
returns table(user_id uuid, email text, notification_email text)
language sql security definer set search_path = public as $$
  select id, email, coalesce(notification_email, email) from public.profiles;
$$;

-- Idempotency: returns true the first time this (user, type, period) is
-- claimed, false on every subsequent attempt (retry, redeploy, etc.).
create or replace function public.claim_notification(
  p_user_id uuid, p_type text, p_period_key text
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_log (user_id, notification_type, period_key)
  values (p_user_id, p_type, p_period_key)
  on conflict (user_id, notification_type, period_key) do nothing;
  return found;
end;
$$;

create or replace function public.create_in_app_notification(
  p_user_id uuid, p_type text, p_title text, p_body text, p_link text default null
) returns void
language sql security definer set search_path = public as $$
  insert into public.in_app_notifications (user_id, type, title, body, link)
  values (p_user_id, p_type, p_title, p_body, p_link);
$$;

create or replace function public.list_push_subscriptions(p_user_id uuid)
returns table(endpoint text, p256dh text, auth_key text)
language sql security definer set search_path = public as $$
  select endpoint, p256dh, auth_key from public.push_subscriptions where user_id = p_user_id;
$$;

-- The core digest: everything a daily/weekly/monthly email or push needs,
-- computed in one place so email content always matches the app's own numbers.
create or replace function public.compute_digest(p_user_id uuid, p_start date, p_end date)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_income numeric := 0;
  v_expenses numeric := 0;
  v_buckets jsonb;
  v_tithe jsonb;
  v_goals jsonb;
  v_bills jsonb;
  v_subs jsonb;
  v_pending jsonb;
begin
  select coalesce(sum(amount), 0) into v_income
    from public.income_transactions where user_id = p_user_id and txn_date between p_start and p_end;

  select coalesce(sum(amount), 0) into v_expenses
    from public.expense_transactions where user_id = p_user_id and txn_date between p_start and p_end;

  select coalesce(jsonb_agg(jsonb_build_object(
      'bucket', b.name,
      'allocated', coalesce(alloc.total, 0),
      'sent', coalesce(alloc.sent_total, 0),
      'pending', coalesce(alloc.total, 0) - coalesce(alloc.sent_total, 0),
      'spent', coalesce(exp.total, 0)
    ) order by b.sort_order), '[]'::jsonb) into v_buckets
  from public.budget_buckets b
  left join (
    select a.bucket_id, sum(a.planned_amount) total,
           sum(a.planned_amount) filter (where a.status = 'sent') sent_total
    from public.allocations a
    join public.income_transactions it on it.id = a.income_transaction_id
    where a.user_id = p_user_id and it.txn_date between p_start and p_end
    group by a.bucket_id
  ) alloc on alloc.bucket_id = b.id
  left join (
    select bucket_id, sum(amount) total from public.expense_transactions
    where user_id = p_user_id and txn_date between p_start and p_end
    group by bucket_id
  ) exp on exp.bucket_id = b.id
  where b.user_id = p_user_id and b.is_active;

  select jsonb_build_object(
      'planned', coalesce(sum(a.planned_amount), 0),
      'sent', coalesce(sum(a.planned_amount) filter (where a.status = 'sent'), 0),
      'pending', coalesce(sum(a.planned_amount) filter (where a.status = 'pending'), 0)
    ) into v_tithe
  from public.allocations a
  join public.income_transactions it on it.id = a.income_transaction_id
  join public.budget_buckets b on b.id = a.bucket_id
  where a.user_id = p_user_id and b.name = 'Tithe' and it.txn_date between p_start and p_end;

  select coalesce(jsonb_agg(jsonb_build_object(
      'bucket', b.name, 'planned_amount', a.planned_amount, 'income_source', it.source
    )), '[]'::jsonb) into v_pending
  from public.allocations a
  join public.budget_buckets b on b.id = a.bucket_id
  join public.income_transactions it on it.id = a.income_transaction_id
  where a.user_id = p_user_id and a.status = 'pending';

  select coalesce(jsonb_agg(jsonb_build_object(
      'name', name, 'target_amount', target_amount, 'current_amount', current_amount, 'status', status
    )), '[]'::jsonb) into v_goals
  from public.goals where user_id = p_user_id and status <> 'completed';

  select coalesce(jsonb_agg(jsonb_build_object(
      'name', name, 'amount', amount, 'next_due', next_due
    )), '[]'::jsonb) into v_bills
  from public.bills
  where user_id = p_user_id and status = 'active' and next_due is not null
    and next_due <= current_date + 7;

  select coalesce(jsonb_agg(jsonb_build_object(
      'service_name', service_name, 'cost', cost, 'next_renewal_date', next_renewal_date
    )), '[]'::jsonb) into v_subs
  from public.subscriptions
  where user_id = p_user_id and status = 'active' and next_renewal_date is not null
    and next_renewal_date <= current_date + 7;

  return jsonb_build_object(
    'period_start', p_start, 'period_end', p_end,
    'total_income', v_income, 'total_expenses', v_expenses,
    'net_cash_flow', v_income - v_expenses,
    'buckets', v_buckets, 'tithe', v_tithe, 'pending_allocations', v_pending,
    'goals', v_goals, 'upcoming_bills', v_bills, 'upcoming_subscriptions', v_subs
  );
end;
$$;
