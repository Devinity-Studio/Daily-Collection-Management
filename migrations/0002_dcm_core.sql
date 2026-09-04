-- ============================================================
-- DCM Core Tables — tenants, subscriptions, customers,
-- collections, profiles, invoices, payments
-- ============================================================

-- Tenant (organization / company)
create table if not exists dcm_tenants (
  id          text primary key,
  user_id     text not null,
  name        text not null,
  code        text not null,
  contact_name text,
  phone       text,
  email       text,
  status      text not null default 'ACTIVE',
  created_at  timestamptz not null default now()
);
create index if not exists dcm_tenants_user_id_idx on dcm_tenants (user_id);

-- Subscription (per-tenant billing plan)
create table if not exists dcm_subscriptions (
  id          text primary key,
  user_id     text not null,
  tenant_id   text not null,
  plan_name   text not null,
  price       numeric(12,2) not null,
  start_date  date not null,
  expiry_date date not null,
  status      text not null default 'ACTIVE',
  created_at  timestamptz not null default now()
);
create index if not exists dcm_subscriptions_user_tenant_idx on dcm_subscriptions (user_id, tenant_id);

-- Customer (contact info per tenant)
create table if not exists dcm_customers (
  id             text primary key,
  user_id        text not null,
  tenant_id      text not null,
  customer_code  text,
  name           text not null,
  phone          text,
  address        text,
  status         text not null default 'ACTIVE',
  created_at     timestamptz not null default now()
);
create index if not exists dcm_customers_user_tenant_idx on dcm_customers (user_id, tenant_id);

-- Collection (daily payment record — immutable financial trail)
create table if not exists dcm_collections (
  id               text primary key,
  user_id          text not null,
  tenant_id        text not null,
  customer_id      text not null,
  collection_date  date not null,
  amount           numeric(12,2) not null,
  payment_method   text not null default 'CASH',
  collector_name   text,
  note             text,
  created_at       timestamptz not null default now()
);
create index if not exists dcm_collections_user_tenant_idx on dcm_collections (user_id, tenant_id);
create index if not exists dcm_collections_date_idx on dcm_collections (collection_date);
create index if not exists dcm_collections_customer_idx on dcm_collections (customer_id);

-- Profile (per-user preferences, currently just active tenant)
create table if not exists dcm_profiles (
  user_id           text primary key,
  active_tenant_id  text
);

-- Invoice (billing invoice per tenant)
create table if not exists dcm_invoices (
  id              text primary key,
  user_id         text not null,
  tenant_id       text not null,
  subscription_id text,
  invoice_number  text not null,
  amount          numeric(12,2) not null,
  due_date        date,
  status          text not null default 'PENDING',
  created_at      timestamptz not null default now()
);
create index if not exists dcm_invoices_user_tenant_idx on dcm_invoices (user_id, tenant_id);

-- Payment (platform subscription payment)
create table if not exists dcm_payments (
  id                text primary key,
  user_id           text not null,
  tenant_id         text not null,
  invoice_id        text not null,
  amount            numeric(12,2) not null,
  payment_method    text,
  payment_reference text,
  status            text not null default 'PENDING',
  note              text,
  created_at        timestamptz not null default now()
);
create index if not exists dcm_payments_user_tenant_idx on dcm_payments (user_id, tenant_id);
