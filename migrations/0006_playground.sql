-- ============================================================
-- Playground Mode: Daily Tasks, Assignments, and Problems
-- Supports the DCM Playground try-first experience
-- ============================================================

-- Playground Demo Tenant (special tenant for demo mode)
create table if not exists dcm_playground_tenants (
  id              text primary key,
  name            text not null,
  code            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists dcm_playground_tenants_code_idx on dcm_playground_tenants (code);

-- Staff members (for playground demo)
create table if not exists dcm_playground_staff (
  id              text primary key,
  tenant_id       text not null references dcm_playground_tenants(id) on delete cascade,
  name            text not null,
  role            text not null default 'COLLECTOR',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists dcm_playground_staff_tenant_idx on dcm_playground_staff (tenant_id);

-- Daily collection tasks
create table if not exists dcm_daily_tasks (
  id                text primary key,
  tenant_id         text not null,
  customer_id       text not null references dcm_customers(id) on delete cascade,
  account_id        text references dcm_accounts(id) on delete set null,
  staff_id          text references dcm_playground_staff(id) on delete set null,
  task_date         date not null,
  status            text not null default 'PENDING',
  priority          text not null default 'NORMAL',
  assigned_staff_id text references dcm_playground_staff(id) on delete set null,
  collector_name    text,
  amount_expected   numeric(14,2),
  amount_collected  numeric(14,2),
  collected_at      timestamptz,
  problem_id        text,
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists dcm_daily_tasks_tenant_idx on dcm_daily_tasks (tenant_id);
create index if not exists dcm_daily_tasks_date_idx on dcm_daily_tasks (task_date);
create index if not exists dcm_daily_tasks_status_idx on dcm_daily_tasks (status);
create index if not exists dcm_daily_tasks_staff_idx on dcm_daily_tasks (staff_id);

-- Assignments (staff assignments to customers)
create table if not exists dcm_assignments (
  id                text primary key,
  tenant_id         text not null,
  customer_id       text not null references dcm_customers(id) on delete cascade,
  responsible_staff_id text not null references dcm_playground_staff(id) on delete cascade,
  assigned_staff_id  text references dcm_playground_staff(id) on delete set null,
  start_date        date not null,
  end_date          date,
  reason            text,
  status            text not null default 'ACTIVE',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists dcm_assignments_tenant_idx on dcm_assignments (tenant_id);
create index if not exists dcm_assignments_customer_idx on dcm_assignments (customer_id);
create index if not exists dcm_assignments_staff_idx on dcm_assignments (responsible_staff_id);

-- Take Over records (when one staff takes over another's work)
create table if not exists dcm_takeovers (
  id                  text primary key,
  tenant_id           text not null,
  original_staff_id   text not null references dcm_playground_staff(id) on delete cascade,
  taking_staff_id     text not null references dcm_playground_staff(id) on delete cascade,
  approving_leader_id text references dcm_playground_staff(id) on delete set null,
  reason              text not null,
  start_date          date not null,
  end_date            date,
  emergency_type      text,
  notification_status text not null default 'PENDING',
  status              text not null default 'ACTIVE',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists dcm_takeovers_tenant_idx on dcm_takeovers (tenant_id);
create index if not exists dcm_takeovers_original_idx on dcm_takeovers (original_staff_id);
create index if not exists dcm_takeovers_taking_idx on dcm_takeovers (taking_staff_id);

-- Problems / Issues (reported during collection)
create table if not exists dcm_problems (
  id                text primary key,
  tenant_id         text not null,
  customer_id       text not null references dcm_customers(id) on delete cascade,
  task_id           text references dcm_daily_tasks(id) on delete set null,
  reported_by       text not null,
  problem_type      text not null,
  description       text,
  amount_involved    numeric(14,2),
  status            text not null default 'REPORTED',
  resolved_by       text,
  resolved_at       timestamptz,
  resolution_note   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists dcm_problems_tenant_idx on dcm_problems (tenant_id);
create index if not exists dcm_problems_customer_idx on dcm_problems (customer_id);
create index if not exists dcm_problems_status_idx on dcm_problems (status);

-- Financial Events (immutable ledger for playground)
create table if not exists dcm_financial_events (
  id                text primary key,
  tenant_id         text not null,
  event_type        text not null,
  account_id        text references dcm_accounts(id) on delete set null,
  customer_id       text references dcm_customers(id) on delete set null,
  installment_id    text references dcm_installments(id) on delete set null,
  collection_id     text references dcm_collections(id) on delete set null,
  amount            numeric(14,2) not null,
  balance_before    numeric(14,2),
  balance_after     numeric(14,2),
  actor_id          text,
  actor_name        text,
  event_date        date not null,
  note              text,
  metadata          jsonb,
  created_at        timestamptz not null default now()
);
create index if not exists dcm_financial_events_tenant_idx on dcm_financial_events (tenant_id);
create index if not exists dcm_financial_events_type_idx on dcm_financial_events (event_type);
create index if not exists dcm_financial_events_date_idx on dcm_financial_events (event_date);
create index if not exists dcm_financial_events_account_idx on dcm_financial_events (account_id);

-- Playground Demo Data Registry (tracks demo data for reset)
create table if not exists dcm_playground_registry (
  id              text primary key,
  tenant_id       text not null,
  entity_type     text not null,
  entity_id       text not null,
  created_at      timestamptz not null default now()
);
create index if not exists dcm_playground_registry_tenant_idx on dcm_playground_registry (tenant_id);
create index if not exists dcm_playground_registry_entity_idx on dcm_playground_registry (entity_type, entity_id);
