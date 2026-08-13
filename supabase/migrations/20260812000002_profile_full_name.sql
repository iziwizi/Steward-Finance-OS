alter table public.profiles add column if not exists full_name text;

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
  insert into public.profiles (id, email, notification_email, full_name)
  values (new.id, new.email, new.email, new.raw_user_meta_data->>'full_name');

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
