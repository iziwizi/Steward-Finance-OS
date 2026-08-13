alter table public.profiles
  add column if not exists currency text not null default 'NGN',
  add column if not exists onboarding_completed_at timestamptz;

-- Existing users should never be forced through onboarding.
update public.profiles set onboarding_completed_at = created_at where onboarding_completed_at is null;
