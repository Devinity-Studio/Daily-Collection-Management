import { getSql } from "@/lib/db";

/**
 * Audit action types — every financial mutation maps to one of these.
 */
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "payment_recorded"
  | "payment_confirmed"
  | "payment_rejected"
  | "subscription_extended"
  | "tenant_switched"
  | "tenant_created";

/**
 * Entity types that can be audited.
 */
export type AuditEntity =
  | "customer"
  | "collection"
  | "account"
  | "installment"
  | "subscription"
  | "invoice"
  | "payment"
  | "tenant"
  | "profile";

/**
 * Audit log entry shape (as stored in DB).
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  tenantId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  reason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

/**
 * Insert an audit log record. Append-only — never updates or deletes.
 *
 * @param params.userId   - The authenticated user performing the action
 * @param params.tenantId - The tenant context
 * @param params.action   - What was done (create, update, delete, etc.)
 * @param params.entity   - Which entity type was affected
 * @param params.entityId - The ID of the affected entity (if applicable)
 * @param params.oldData  - Previous state before the mutation (for updates/deletes)
 * @param params.newData  - New state after the mutation (for creates/updates)
 * @param params.reason   - Optional reason for the action
 * @param params.ipAddress - Optional IP address of the requester
 */
export async function auditLog(params: {
  userId: string;
  tenantId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  reason?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into dcm_audit_logs
      (id, user_id, tenant_id, action, entity, entity_id, old_data, new_data, reason, ip_address)
    values (
      ${id},
      ${params.userId},
      ${params.tenantId},
      ${params.action},
      ${params.entity},
      ${params.entityId ?? null},
      ${params.oldData ? JSON.stringify(params.oldData) : null}::jsonb,
      ${params.newData ? JSON.stringify(params.newData) : null}::jsonb,
      ${params.reason ?? null},
      ${params.ipAddress ?? null}
    )`;
}

/**
 * Query audit logs for a tenant, with optional filters.
 */
export async function queryAuditLogs(params: {
  tenantId: string;
  entity?: string;
  entityId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogEntry[]> {
  const sql = await getSql();
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  const rows = await sql<Record<string, unknown>>`
    select
      id, user_id, tenant_id, action, entity, entity_id,
      old_data, new_data, reason, ip_address,
      created_at::text
    from dcm_audit_logs
    where tenant_id = ${params.tenantId}
      and (${params.entity ?? null}::text is null or entity = ${params.entity})
      and (${params.entityId ?? null}::text is null or entity_id = ${params.entityId})
      and (${params.action ?? null}::text is null or action = ${params.action})
    order by created_at desc
    limit ${limit} offset ${offset}`;

  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    tenantId: String(r.tenant_id),
    action: String(r.action) as AuditAction,
    entity: String(r.entity) as AuditEntity,
    entityId: (r.entity_id as string) ?? null,
    oldData: r.old_data ? (typeof r.old_data === "string" ? JSON.parse(r.old_data as string) : r.old_data) : null,
    newData: r.new_data ? (typeof r.new_data === "string" ? JSON.parse(r.new_data as string) : r.new_data) : null,
    reason: (r.reason as string) ?? null,
    ipAddress: (r.ip_address as string) ?? null,
    createdAt: String(r.created_at),
  }));
}
