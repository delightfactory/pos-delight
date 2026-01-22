
-- Create a dedicated schema for the POS system to isolate it from the main project
create schema if not exists pos;

-- Grant usage on this new schema to the anon and authenticated roles (required for Supabase API access)
grant usage on schema pos to anon, authenticated, service_role;

-- Grant all privileges on all tables in the schema to service_role (for admin tasks)
alter default privileges in schema pos grant all on tables to service_role;
alter default privileges in schema pos grant all on sequences to service_role;

-- Grant select/insert/update/delete to anon/authenticated for this specific app (Simpler permission model for POS)
alter default privileges in schema pos grant all on tables to anon, authenticated;
alter default privileges in schema pos grant all on sequences to anon, authenticated;

-- Products Table in 'pos' schema
create table if not exists pos.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text,
  price numeric not null check (price >= 0),
  sale_price numeric check (sale_price >= 0),
  image_url text,
  stock integer default 0,
  category text,
  description text,
  is_featured boolean default false,
  created_at timestamp with time zone default now()
);

-- Invoices Table in 'pos' schema
create table if not exists pos.invoices (
  id uuid primary key default uuid_generate_v4(),
  customer_name text,
  customer_phone text,
  total_amount numeric not null default 0,
  discount_amount numeric default 0,
  discount_type text check (discount_type in ('fixed', 'percent')),
  created_at timestamp with time zone default now()
);

-- Invoice Items Table in 'pos' schema
create table if not exists pos.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references pos.invoices(id) on delete cascade,
  product_id uuid references pos.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  price numeric not null,
  total numeric not null
);

-- RLS Policies
-- We enable RLS on these tables but allow open access for the POS app usage.
-- Since this is running on an existing project, we want to be explicit.

alter table pos.products enable row level security;
alter table pos.invoices enable row level security;
alter table pos.invoice_items enable row level security;

-- Policies for Products
create policy "POS: Allow public read products" on pos.products for select using (true);
create policy "POS: Allow public write products" on pos.products for insert with check (true);
create policy "POS: Allow public update products" on pos.products for update using (true);
create policy "POS: Allow public delete products" on pos.products for delete using (true);

-- Policies for Invoices
create policy "POS: Allow public read invoices" on pos.invoices for select using (true);
create policy "POS: Allow public insert invoices" on pos.invoices for insert with check (true);

-- Policies for Invoice Items
create policy "POS: Allow public read items" on pos.invoice_items for select using (true);
create policy "POS: Allow public insert items" on pos.invoice_items for insert with check (true);

-- IMPORTANT: You must go to Supabase Dashboard -> Settings -> API 
-- and add 'pos' to the "Exposed schemas" list for this to work via the JS Client!
