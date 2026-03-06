create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  merchant_refund_id text not null unique,
  phonepe_refund_id text,
  amount_paise bigint not null check (amount_paise >= 100),
  status text not null check (status in ('PENDING', 'CONFIRMED', 'COMPLETED', 'FAILED')),
  reason text,
  phonepe_raw_create_response jsonb,
  phonepe_raw_status_response jsonb,
  error_context jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create index if not exists idx_refunds_order_id on public.refunds(order_id);
create index if not exists idx_refunds_status on public.refunds(status);
create index if not exists idx_refunds_created_at on public.refunds(created_at desc);

alter table public.refunds disable row level security;
