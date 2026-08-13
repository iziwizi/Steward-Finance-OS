
drop index if exists idx_celebrations_dedupe;
alter table public.celebrations alter column related_entity set default '';
update public.celebrations set related_entity = '' where related_entity is null;
alter table public.celebrations alter column related_entity set not null;
create unique index idx_celebrations_dedupe on public.celebrations(user_id, type, related_entity);
