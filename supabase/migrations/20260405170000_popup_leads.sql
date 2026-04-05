create table if not exists public.popup_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text not null,
  selected_option_label text not null,
  selected_option_href text,
  source_path text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_popup_leads_created_at on public.popup_leads(created_at desc);
create index if not exists idx_popup_leads_email on public.popup_leads(email);

alter table public.popup_leads disable row level security;
