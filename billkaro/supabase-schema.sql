-- ============================================
-- BillKaro Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  plan text default 'free' check (plan in ('free', 'pro', 'business')),
  invoice_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- BUSINESSES TABLE
-- ============================================
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  gstin text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  bank_name text,
  bank_account text,
  bank_ifsc text,
  bank_holder text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.businesses enable row level security;

create policy "Users can CRUD own businesses"
  on public.businesses for all
  using (auth.uid() = user_id);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  gstin text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  created_at timestamptz default now()
);

alter table public.customers enable row level security;

create policy "Users can CRUD own customers"
  on public.customers for all
  using (auth.uid() = user_id);

-- ============================================
-- INVOICES TABLE
-- ============================================
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  business_id uuid references public.businesses(id),
  customer_id uuid references public.customers(id),

  -- Invoice meta
  invoice_number text not null,
  invoice_date date not null,
  due_date date,
  place_of_supply text,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

  -- GST
  gst_type text default 'cgst' check (gst_type in ('cgst', 'igst')),
  gst_rate numeric default 18,

  -- Seller snapshot
  seller_name text,
  seller_gstin text,
  seller_address text,
  seller_phone text,
  seller_email text,

  -- Buyer snapshot
  buyer_name text,
  buyer_gstin text,
  buyer_address text,
  buyer_phone text,
  buyer_email text,

  -- Items (JSON array)
  items jsonb default '[]',

  -- Totals
  subtotal numeric default 0,
  total_gst numeric default 0,
  grand_total numeric default 0,

  -- Bank + Notes
  bank_name text,
  bank_account text,
  bank_ifsc text,
  bank_holder text,
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;

create policy "Users can CRUD own invoices"
  on public.invoices for all
  using (auth.uid() = user_id);

-- Index for fast queries
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_status_idx on public.invoices(status);
create index invoices_created_at_idx on public.invoices(created_at desc);
