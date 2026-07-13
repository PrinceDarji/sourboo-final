alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;

create index if not exists idx_orders_confirmation_email_sent_at
  on public.orders(confirmation_email_sent_at);
