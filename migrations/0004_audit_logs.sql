-- ============================================================
-- Audit Logs — immutable, append-only
-- Records every financial mutation for compliance & debugging.
-- ============================================================

create table if not exists dcm_audit_logs (
  id           text primary key,
  user_id      text not null,
  tenant_id    text not null,
  action       text not null,
  entity       text not null,
  entity_id    text,
  old_data     jsonb,
  new_data     jsonb,
  reason       text,
  ip_address   text,
  created_at   timestamptz not null default now()
);

create index if not exists dcm_audit_logs_tenant_idx on dcm_audit_logs (tenant_id);
create index if not exists dcm_audit_logs_entity_idx on dcm_audit_logs (tenant_id, entity, entity_id);
create index if not exists dcm_audit_logs_action_idx on dcm_audit_logs (tenant_id, action);
create index if not exists dcm_audit_logs_created_idx on dcm_audit_logs (tenant_id, created_at);
