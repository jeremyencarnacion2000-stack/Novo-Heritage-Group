-- Create leads table for capturing inquiries across divisions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  division text not null check (division in ('bienes_raices','seguros','turismo')),
  property_id text null,
  name text not null,
  email text not null,
  phone text null,
  message text null,
  source text null,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists leads_division_idx on public.leads(division);
create index if not exists leads_property_idx on public.leads(property_id);

-- Sample seed (optional)
insert into public.leads (division, property_id, name, email, phone, message, source)
values
  ('bienes_raices', 'prop-1', 'Cliente Prueba', 'cliente@example.com', '+1 809 000 0000', 'Me interesa agendar visita', 'web')
on conflict do nothing;

