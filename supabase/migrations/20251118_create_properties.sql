-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  address text,
  location text,
  status text,
  price numeric,
  type text,
  bedrooms integer,
  bathrooms integer,
  area integer,
  year_built integer,
  description text,
  features jsonb,
  agent_name text,
  agent_phone text,
  image text,
  images text[]
);

-- Sample seed data
insert into public.properties (title, address, location, status, price, type, bedrooms, bathrooms, area, year_built, description, features, agent_name, agent_phone, image, images)
values
('Casa Moderna en Zona Residencial','Av. Homero 123, Polanco, CDMX','Polanco, Ciudad de México','available',5800000,'casa',4,3,320,2018,'Residencia contemporánea con acabados premium, iluminación natural y amplio jardín.',
  '["Cocina equipada","Sala de TV","Terraza","Estacionamiento para 2 autos"]',
  'María López','+52 55 1234 5678','/placeholder.jpg', ARRAY['/placeholder.jpg','/placeholder.jpg','/placeholder.jpg','/placeholder.jpg','/placeholder.jpg']),
('Departamento de Lujo con Vista','Carretera México-Toluca 456, Santa Fe, CDMX','Santa Fe, Ciudad de México','available',3200000,'apartamento',3,2,180,2020,'Departamento con vista panorámica, área social abierta y seguridad 24/7.',
  '["Gimnasio","Alberca","Roof garden","Salón de usos múltiples"]',
  'Carlos Pérez','+52 55 9876 5432','/placeholder.jpg', ARRAY['/placeholder.jpg','/placeholder.jpg','/placeholder.jpg','/placeholder.jpg','/placeholder.jpg']),
('Penthouse Exclusivo','Av. Nuevo León 89, Condesa, CDMX','Condesa, Ciudad de México','available',8500000,'penthouse',5,4,450,2015,'Penthouse de doble altura con terraza privada y acabados de lujo.',
  '["Elevador privado","Terraza panorámica","Wine room","Smart home"]',
  'Ana García','+52 55 2468 1357','/placeholder.jpg', ARRAY['/placeholder.jpg','/placeholder.jpg','/placeholder.jpg','/placeholder.jpg','/placeholder.jpg'])
on conflict do nothing;
