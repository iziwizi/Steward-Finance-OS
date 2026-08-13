-- Self-service account deletion, without ever needing a service-role key
-- client-side (this app deliberately never holds one — see migration 08's
-- notification RPC pattern). A normal authenticated role cannot delete from
-- auth.users directly; this function runs as its (elevated) owner but is
-- narrowly scoped to the caller's own row via auth.uid(), so a user can only
-- ever delete their own account. Every user-owned table cascades from
-- auth.users(id) on delete cascade, so this alone fully erases the account.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
