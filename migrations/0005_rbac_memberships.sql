-- ============================================================
-- RBAC: Tenant Memberships & Roles
-- ============================================================

-- Role definitions for the app
CREATE TABLE IF NOT EXISTS dcm_roles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenant memberships: links users to tenants with a role
CREATE TABLE IF NOT EXISTS dcm_memberships (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  tenant_id   TEXT NOT NULL REFERENCES dcm_tenants(id) ON DELETE CASCADE,
  role_id     TEXT NOT NULL REFERENCES dcm_roles(id),
  invited_by  TEXT,
  status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INVITED','DISABLED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_tenant ON dcm_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON dcm_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON dcm_memberships(role_id);

-- Seed default roles
INSERT INTO dcm_roles (id, name, description, permissions) VALUES
  ('role_owner',   'Owner',   'เจ้าขององค์กร - มีสิทธิ์ทุกอย่าง',
    '["manage_members","manage_settings","view_reports","manage_customers","manage_collections","manage_accounts","manage_billing","view_audit","manage_tenants"]'),
  ('role_admin',   'Admin',   'ผู้ดูแลระบบ - จัดการข้อมูลและสมาชิก',
    '["manage_members","view_reports","manage_customers","manage_collections","manage_accounts","manage_billing","view_audit"]'),
  ('role_manager', 'Manager', 'ผู้จัดการ - ดูรายงานและจัดการลูกค้า',
    '["view_reports","manage_customers","manage_collections","manage_accounts","view_audit"]'),
  ('role_collector','Collector','พนักงานเก็บเงิน - บันทึกรายการเก็บเงิน',
    '["manage_collections","view_reports"]'),
  ('role_viewer',  'Viewer',  'ผู้ชม - ดูข้อมูลเท่านั้น',
    '["view_reports"]')
ON CONFLICT (name) DO NOTHING;
