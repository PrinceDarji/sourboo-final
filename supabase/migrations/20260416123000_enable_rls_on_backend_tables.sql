-- These tables are only accessed from trusted server code using the Supabase
-- service role key. Enable RLS so public-schema tables are not exposed through
-- the API, and keep policies restricted to the backend service role.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.refunds enable row level security;
alter table public.popup_leads enable row level security;

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

drop policy if exists popup_leads_service_role_all on public.popup_leads;
create policy popup_leads_service_role_all
on public.popup_leads
for all
to service_role
using (true)
with check (true);
