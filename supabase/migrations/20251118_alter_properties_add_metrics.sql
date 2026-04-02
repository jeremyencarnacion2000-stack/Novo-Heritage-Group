-- Add real metrics to properties for ROI calculations
alter table if exists public.properties
  add column if not exists estimated_rent_monthly numeric null,
  add column if not exists hoa_fee_monthly numeric null,
  add column if not exists taxes_annual numeric null,
  add column if not exists maintenance_annual numeric null,
  add column if not exists occupancy_rate numeric null;

-- Optional: seed example metrics for existing sample properties
update public.properties set
  estimated_rent_monthly = 2500,
  hoa_fee_monthly = 120,
  taxes_annual = 800,
  maintenance_annual = 1000,
  occupancy_rate = 0.92
where id = 'prop-001';

update public.properties set
  estimated_rent_monthly = 1800,
  hoa_fee_monthly = 150,
  taxes_annual = 600,
  maintenance_annual = 800,
  occupancy_rate = 0.9
where id = 'prop-002';

update public.properties set
  estimated_rent_monthly = 3800,
  hoa_fee_monthly = 200,
  taxes_annual = 1200,
  maintenance_annual = 1500,
  occupancy_rate = 0.94
where id = 'prop-003';

