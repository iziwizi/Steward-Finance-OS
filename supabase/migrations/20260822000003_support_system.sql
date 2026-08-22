-- Migration for in-app Support Ticket System
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  category text not null default 'General Support',
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting_for_user', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null default 'user' check (sender_role in ('user', 'admin')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_user on public.support_tickets(user_id, created_at desc);
create index if not exists idx_support_messages_ticket on public.support_messages(ticket_id, created_at asc);

-- Enable RLS
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

-- Policies for support_tickets
create policy "tickets_user_select" on public.support_tickets
  for select using (auth.uid() = user_id or public.is_admin());

create policy "tickets_user_insert" on public.support_tickets
  for insert with check (auth.uid() = user_id);

create policy "tickets_admin_update" on public.support_tickets
  for update using (public.is_admin() or auth.uid() = user_id);

-- Policies for support_messages
create policy "messages_user_select" on public.support_messages
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.support_tickets
      where id = support_messages.ticket_id and user_id = auth.uid()
    )
  );

create policy "messages_user_insert" on public.support_messages
  for insert with check (
    auth.uid() = sender_id and (
      public.is_admin() or
      exists (
        select 1 from public.support_tickets
        where id = support_messages.ticket_id and user_id = auth.uid()
      )
    )
  );
