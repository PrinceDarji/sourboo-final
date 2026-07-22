alter table public.orders
  add column if not exists zoho_contact_id text,
  add column if not exists zoho_invoice_id text,
  add column if not exists zoho_invoice_number text,
  add column if not exists zoho_payment_id text,
  add column if not exists zoho_invoice_created_at timestamptz,
  add column if not exists zoho_invoice_pdf_fetched_at timestamptz,
  add column if not exists zoho_invoice_error_context jsonb;

create index if not exists idx_orders_zoho_invoice_id
  on public.orders(zoho_invoice_id);

create index if not exists idx_orders_zoho_invoice_created_at
  on public.orders(zoho_invoice_created_at desc);
