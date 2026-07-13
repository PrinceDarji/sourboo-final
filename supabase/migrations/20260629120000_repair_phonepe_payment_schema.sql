create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid()
);

alter table public.orders
  add column if not exists merchant_order_id text,
  add column if not exists phonepe_order_id text,
  add column if not exists status text,
  add column if not exists amount_paise bigint,
  add column if not exists currency text default 'INR',
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists shipping_address jsonb,
  add column if not exists cart_snapshot_json jsonb,
  add column if not exists phonepe_redirect_url text,
  add column if not exists phonepe_raw_create_response jsonb,
  add column if not exists phonepe_raw_status_response jsonb,
  add column if not exists error_context jsonb,
  add column if not exists paid_at timestamptz,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

create unique index if not exists idx_orders_merchant_order_id_unique
  on public.orders(merchant_order_id)
  where merchant_order_id is not null;
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_status_check
      check (status in ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'))
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_amount_paise_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_amount_paise_check
      check (amount_paise > 0)
      not valid;
  end if;
end $$;

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

alter table public.order_items
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists product_slug text,
  add column if not exists product_name text,
  add column if not exists unit_price_paise bigint,
  add column if not exists quantity integer,
  add column if not exists line_total_paise bigint,
  add column if not exists created_at timestamptz default timezone('utc', now());

create index if not exists idx_order_items_order_id on public.order_items(order_id);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  source text not null check (source in ('create', 'status_poll', 'return_page', 'webhook')),
  idempotency_key text not null unique,
  payload_json jsonb not null,
  received_at timestamptz not null default timezone('utc', now())
);

alter table public.payment_events
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists source text,
  add column if not exists idempotency_key text,
  add column if not exists payload_json jsonb,
  add column if not exists received_at timestamptz default timezone('utc', now());

create unique index if not exists idx_payment_events_idempotency_key_unique
  on public.payment_events(idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_payment_events_order_id on public.payment_events(order_id);
create index if not exists idx_payment_events_received_at on public.payment_events(received_at desc);

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

alter table public.refunds
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists merchant_refund_id text,
  add column if not exists phonepe_refund_id text,
  add column if not exists amount_paise bigint,
  add column if not exists status text,
  add column if not exists reason text,
  add column if not exists phonepe_raw_create_response jsonb,
  add column if not exists phonepe_raw_status_response jsonb,
  add column if not exists error_context jsonb,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now()),
  add column if not exists completed_at timestamptz;

create unique index if not exists idx_refunds_merchant_refund_id_unique
  on public.refunds(merchant_refund_id)
  where merchant_refund_id is not null;
create index if not exists idx_refunds_order_id on public.refunds(order_id);
create index if not exists idx_refunds_status on public.refunds(status);
create index if not exists idx_refunds_created_at on public.refunds(created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.refunds enable row level security;

drop policy if exists orders_service_role_all on public.orders;
create policy orders_service_role_all
on public.orders
for all
to service_role
using (true)
with check (true);

drop policy if exists order_items_service_role_all on public.order_items;
create policy order_items_service_role_all
on public.order_items
for all
to service_role
using (true)
with check (true);

drop policy if exists payment_events_service_role_all on public.payment_events;
create policy payment_events_service_role_all
on public.payment_events
for all
to service_role
using (true)
with check (true);

drop policy if exists refunds_service_role_all on public.refunds;
create policy refunds_service_role_all
on public.refunds
for all
to service_role
using (true)
with check (true);

notify pgrst, 'reload schema';
