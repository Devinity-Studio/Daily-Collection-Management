import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Protected } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getDashboard } from "@/lib/dcm/server";
import { formatDateTh } from "@/lib/format";
import { FileText } from "lucide-react";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/audit")({ component: AuditPage });

// Simplified audit log type for client (no Record<string, unknown>)
type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  newDataStr: string | null;
  oldDataStr: string | null;
  createdAt: string;
};

// Server function to fetch audit logs
const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { entity?: string; action?: string; limit?: number; offset?: number }) => d)
  .handler(async ({ context, data }): Promise<AuditLog[]> => {
    const sql = await getSql();
    const profile = await sql<{ active_tenant_id: string }>`
      select active_tenant_id from dcm_profiles where user_id = ${context.userId}`;
    const tenantId = profile[0]?.active_tenant_id;
    if (!tenantId) return [];

    const limit = data.limit ?? 20;
    const offset = data.offset ?? 0;

    const rows = await sql<Record<string, unknown>>`
      select id, action, entity, entity_id,
             old_data::text as old_data_str,
             new_data::text as new_data_str,
             created_at::text
      from dcm_audit_logs
      where tenant_id = ${tenantId}
        and (${data.entity ?? null}::text is null or entity = ${data.entity})
        and (${data.action ?? null}::text is null or action = ${data.action})
      order by created_at desc
      limit ${limit} offset ${offset}`;

    return rows.map((r) => ({
      id: String(r.id),
      action: String(r.action),
      entity: String(r.entity),
      entityId: (r.entity_id as string) ?? null,
      newDataStr: (r.new_data_str as string) ?? null,
      oldDataStr: (r.old_data_str as string) ?? null,
      createdAt: String(r.created_at),
    }));
  });

function AuditPage() {
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const logs = useQuery({
    queryKey: ["audit-logs", entity, action, page],
    queryFn: () => getAuditLogs({ data: { entity: entity || undefined, action: action || undefined, limit, offset: page * limit } }),
  });

  const tenantName = dash.data?.tenant.name;

  return (
    <Protected tenantName={tenantName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ประวัติการเปลี่ยนแปลง</h1>
          <p className="text-sm text-muted-foreground">บันทึกทุกการกระทำทางการเงิน — ห้ามแก้ไขหรือลบ</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>ประเภทข้อมูล</Label>
          <Select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(0); }}>
            <option value="">ทั้งหมด</option>
            <option value="customer">ลูกค้า</option>
            <option value="collection">รายการเก็บเงิน</option>
            <option value="account">บัญชีเงินกู้</option>
            <option value="installment">งวดผ่อนชำระ</option>
            <option value="payment">การชำระเงิน</option>
            <option value="subscription">สมาชิก</option>
            <option value="tenant">องค์กร</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>การกระทำ</Label>
          <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(0); }}>
            <option value="">ทั้งหมด</option>
            <option value="create">สร้าง</option>
            <option value="update">แก้ไข</option>
            <option value="delete">ลบ</option>
            <option value="payment_recorded">บันทึกชำระ</option>
            <option value="payment_confirmed">ยืนยันชำระ</option>
            <option value="payment_rejected">ปฏิเสธชำระ</option>
            <option value="subscription_extended">ต่ออายุ</option>
            <option value="tenant_switched">สลับองค์กร</option>
            <option value="tenant_created">สร้างองค์กร</option>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" onClick={() => { setEntity(""); setAction(""); setPage(0); }}>
            ล้างตัวกรอง
          </Button>
        </div>
      </div>

      {/* Log list */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        {logs.isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">กำลังโหลด...</p>
        ) : !logs.data || logs.data.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเปลี่ยนแปลง</p>
          </div>
        ) : (
          (logs.data as AuditLog[]).map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={ACTION_TONE[log.action] ?? "neutral"}>
                    {ACTION_LABEL[log.action] ?? log.action}
                  </Badge>
                  <Badge>
                    {ENTITY_LABEL[log.entity] ?? log.entity}
                  </Badge>
                  {log.entityId ? (
                    <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                      {log.entityId.slice(0, 8)}…
                    </span>
                  ) : null}
                </div>
                {log.newDataStr ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDataPreview(log.newDataStr)}
                  </p>
                ) : null}
                {log.oldDataStr && log.action === "delete" ? (
                  <p className="mt-1 text-xs text-destructive">
                    ลบ: {formatDataPreview(log.oldDataStr)}
                  </p>
                ) : null}
              </div>
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDateTh(log.createdAt.slice(0, 10))}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {logs.data && (logs.data as AuditLog[]).length === limit ? (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ก่อนหน้า
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
            ถัดไป
          </Button>
        </div>
      ) : null}
    </Protected>
  );
}

function formatDataPreview(jsonStr: string): string {
  try {
    const data = JSON.parse(jsonStr);
    const parts: string[] = [];
    if (data.amount != null) parts.push(`฿${Number(data.amount).toLocaleString()}`);
    if (data.name) parts.push(String(data.name));
    if (data.paymentMethod) parts.push(METHOD_LABEL[String(data.paymentMethod)] ?? String(data.paymentMethod));
    if (data.status) parts.push(`สถานะ: ${STATUS_LABEL[String(data.status)] ?? String(data.status)}`);
    if (data.accountNumber) parts.push(String(data.accountNumber));
    if (data.termMonths) parts.push(`${data.termMonths} เดือน`);
    if (data.originalAmount) parts.push(`ต้น: ฿${Number(data.originalAmount).toLocaleString()}`);
    if (data.startDate) parts.push(`เริ่ม: ${String(data.startDate)}`);
    if (data.expiryDate) parts.push(`หมดอายุ: ${String(data.expiryDate)}`);
    if (parts.length === 0) return jsonStr.slice(0, 100);
    return parts.join(" · ");
  } catch {
    return jsonStr.slice(0, 100);
  }
}

const ACTION_LABEL: Record<string, string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  payment_recorded: "บันทึกชำระ",
  payment_confirmed: "ยืนยันชำระ",
  payment_rejected: "ปฏิเสธชำระ",
  subscription_extended: "ต่ออายุ",
  tenant_switched: "สลับองค์กร",
  tenant_created: "สร้างองค์กร",
};

const ACTION_TONE: Record<string, "success" | "warn" | "danger" | "primary" | "neutral"> = {
  create: "success",
  update: "warn",
  delete: "danger",
  payment_recorded: "primary",
  payment_confirmed: "success",
  payment_rejected: "danger",
  subscription_extended: "primary",
  tenant_switched: "neutral",
  tenant_created: "success",
};

const ENTITY_LABEL: Record<string, string> = {
  customer: "ลูกค้า",
  collection: "รายการเก็บเงิน",
  account: "บัญชีเงินกู้",
  installment: "งวดผ่อน",
  payment: "การชำระ",
  subscription: "สมาชิก",
  invoice: "ใบแจ้งหนี้",
  tenant: "องค์กร",
  profile: "โปรไฟล์",
};

const METHOD_LABEL: Record<string, string> = {
  CASH: "เงินสด",
  BANK_TRANSFER: "โอนเงิน",
  QR_CODE: "QR Code",
  OTHER: "อื่น ๆ",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "ใช้งาน",
  PENDING_PAYMENT: "รอชำระ",
  EXPIRED: "หมดอายุ",
  SUSPENDED: "ระงับ",
  PENDING: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  PAID: "ชำระแล้ว",
  REJECTED: "ปฏิเสธ",
  DISABLED: "ปิดใช้งาน",
  REVERSED: "กลับรายการ",
};
