/**
 * RBAC (Role-Based Access Control) helpers for tenant membership management.
 *
 * Roles are global (shared across tenants). Memberships link users to tenants
 * with a specific role. Permissions are stored as JSON arrays on the role.
 */

export type RoleName = "Owner" | "Admin" | "Manager" | "Collector" | "Viewer";

export type Permission =
  | "manage_members"
  | "manage_settings"
  | "view_reports"
  | "manage_customers"
  | "manage_collections"
  | "manage_accounts"
  | "manage_billing"
  | "view_audit"
  | "manage_tenants";

export type MembershipStatus = "ACTIVE" | "INVITED" | "DISABLED";

export type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
};

export type Membership = {
  id: string;
  userId: string;
  tenantId: string;
  roleId: string;
  roleName: string;
  invitedBy: string | null;
  status: MembershipStatus;
  createdAt: string;
};

export type MembershipWithUser = Membership & {
  userName: string | null;
  userEmail: string | null;
};

/** All permissions required for each page/feature. */
export const PAGE_PERMISSIONS: Record<string, Permission[]> = {
  dashboard: ["view_reports"],
  collections: ["manage_collections"],
  customers: ["manage_customers"],
  reports: ["view_reports"],
  accounts: ["manage_accounts"],
  subscription: ["manage_billing"],
  audit: ["view_audit"],
  tenants: ["manage_tenants"],
  members: ["manage_members"],
};

/** Role hierarchy (higher index = more privilege). */
const ROLE_HIERARCHY: RoleName[] = ["Viewer", "Collector", "Manager", "Admin", "Owner"];

export function roleLevel(roleName: string): number {
  const idx = ROLE_HIERARCHY.indexOf(roleName as RoleName);
  return idx >= 0 ? idx : -1;
}

export function hasPermission(rolePermissions: Permission[], required: Permission): boolean {
  return rolePermissions.includes(required);
}

export function hasAnyPermission(rolePermissions: Permission[], required: Permission[]): boolean {
  return required.some((p) => rolePermissions.includes(p));
}

/** Permission labels for UI display. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_members: "จัดการสมาชิก",
  manage_settings: "จัดการตั้งค่า",
  view_reports: "ดูรายงาน",
  manage_customers: "จัดการลูกค้า",
  manage_collections: "จัดการเก็บเงิน",
  manage_accounts: "จัดการบัญชีเงินกู้",
  manage_billing: "จัดการการชำระเงิน",
  view_audit: "ดูประวัติ",
  manage_tenants: "จัดการองค์กร",
};

/** Role labels for UI display. */
export const ROLE_LABELS: Record<RoleName, string> = {
  Owner: "เจ้าของ",
  Admin: "ผู้ดูแล",
  Manager: "ผู้จัดการ",
  Collector: "พนักงานเก็บเงิน",
  Viewer: "ผู้ชม",
};
