-- ============================================================
-- Accounts / Loans & Installments
-- Domain model v2.0: financial obligations separated from
-- customer contact data. A customer may have multiple accounts.
-- ============================================================

-- Account / Loan (financial obligation)
create table if not exists dcm_accounts (
  id                   text primary key,
  user_id              text not null,
  tenant_id            text not null,
  customer_id          text not null references dcm_customers(id) on delete cascade,
  account_number       text not null,
  account_type         text not null default 'PERSONAL_LOAN',
  original_amount      numeric(14,2) not null,
  interest_rate        numeric(5,2) default 0,
  currency             text default 'THB',
  term_months          integer,
  payment_frequency    text default 'MONTHLY',
  disbursement_date    date not null,
  first_due_date       date,
  maturity_date        date,
  outstanding_balance  numeric(14,2) not null,
  total_paid           numeric(14,2) default 0,
  status               text not null default 'ACTIVE',
  classification       text,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists dcm_accounts_user_tenant_idx on dcm_accounts (user_id, tenant_id);
create index if not exists dcm_accounts_customer_idx on dcm_accounts (customer_id);
create index if not exists dcm_accounts_status_idx on dcm_accounts (status);

-- Installment (payment schedule for an account)
create table if not exists dcm_installments (
  id                  text primary key,
  user_id             text not null,
  tenant_id           text not null,
  account_id          text not null references dcm_accounts(id) on delete cascade,
  installment_number  integer not null,
  principal_amount    numeric(14,2) not null,
  interest_amount     numeric(14,2) default 0,
  total_amount        numeric(14,2) not null,
  due_date            date not null,
  paid_date           date,
  amount_paid         numeric(14,2) default 0,
  penalty_amount      numeric(14,2) default 0,
  status              text not null default 'PENDING',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(account_id, installment_number)
);
create index if not exists dcm_installments_account_idx on dcm_installments (account_id);
create index if not exists dcm_installments_status_idx on dcm_installments (status);
create index if not exists dcm_installments_due_date_idx on dcm_installments (due_date);
