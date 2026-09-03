-- Daily Collection Management schema (per-user isolated)

create table if not exists dcm_tenants (
  id text primary key,
  user_id text not null,
  name text not null,
  code text not null,
  contact_name text,
  phone text,
  email text,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);
create index if not exists dcm_tenants_user_idx on dcm_tenants (user_id);

create table if not exists dcm_profiles (
  user_id text primary key,
  active_tenant_id text,
  created_at timestamptz not null default now()
);

create table if not exists dcm_subscriptions (
  id text primary key,
  user_id text not null,
  tenant_id text not null,
  plan_name text not null default 'Standard',
  price numeric(12,2) not null default 5000,
  start_date date not null,
  expiry_date date not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists dcm_subs_user_idx on dcm_subscriptions (user_id, tenant_id);

create table if not exists dcm_invoices (
  id text primary key,
  user_id text not null,
  tenant_id text not null,
  subscription_id text not null,
  invoice_number text not null,
  amount numeric(12,2) not null,
  due_date date,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);
create index if not exists dcm_invoices_user_idx on dcm_invoices (user_id, tenant_id);

create table if not exists dcm_payments (
  id text primary key,
  user_id text not null,
  tenant_id text not null,
  invoice_id text not null,
  amount numeric(12,2) not null,
  payment_method text,
  payment_reference text,
  status text not null default 'PENDING',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists dcm_payments_user_idx on dcm_payments (user_id, status);

create table if not exists dcm_customers (
  id text primary key,
  user_id text not null,
  tenant_id text not null,
  customer_code text,
  name text not null,
  phone text,
  address text,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);
create index if not exists dcm_customers_user_idx on dcm_customers (user_id, tenant_id);

create table if not exists dcm_collections (
  id text primary key,
  user_id text not null,
  tenant_id text not null,
  customer_id text not null,
  collection_date date not null,
  amount numeric(12,2) not null,
  payment_method text not null,
  collector_name text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists dcm_collections_user_date_idx on dcm_collections (user_id, tenant_id, collection_date);
