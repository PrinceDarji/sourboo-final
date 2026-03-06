create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  merchant_order_id text not null unique,
  phonepe_order_id text,
  status text not null check (status in ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED')),
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  cart_snapshot_json jsonb,
  phonepe_redirect_url text,
  phonepe_raw_create_response jsonb,
  phonepe_raw_status_response jsonb,
  error_context jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  unit_price_paise bigint not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0),
  line_total_paise bigint not null check (line_total_paise >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  source text not null check (source in ('create', 'status_poll', 'return_page', 'webhook')),
  idempotency_key text not null unique,
  payload_json jsonb not null,
  received_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_payment_events_order_id on public.payment_events(order_id);
create index if not exists idx_payment_events_received_at on public.payment_events(received_at desc);

-- Payment tables are backend-only in this app; server writes via privileged key.
alter table public.orders disable row level security;
alter table public.order_items disable row level security;
alter table public.payment_events disable row level security;
