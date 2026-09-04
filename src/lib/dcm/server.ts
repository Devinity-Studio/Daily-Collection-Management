import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { todayISO } from "@/lib/format";
import { auditLog, type AuditAction, type AuditEntity } from "./audit";
import type {
  Account,
  AccountSummary,
  AccountType,
  Collection,
  Customer,
  Classification,
  DailyReport,
  DashboardData,
  Installment,
  InstallmentStatus,
  Invoice,
  MethodBreakdown,
  MonthlyReport,
  Payment,
  Subscription,
  Tenant,
} from "./types";

function n(v: unknown): number {
  const x = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
  return Number.isFinite(x) ? x : 0;
}

function addMonthsMinusDay(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + months);
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

function mapTenant(row: Record<string, unknown>): Tenant {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    contactName: (row.contact_name as string) ?? null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    status: row.status as Tenant["status"],
    createdAt: String(row.created_at),
  };
}

function mapSub(row: Record<string, unknown>, today: string): Subscription {
  const expiry = String(row.expiry_date);
  const status = String(row.status) as Subscription["status"];
  const remaining = status === "ACTIVE" ? Math.max(0, daysBetween(today, expiry)) : 0;
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    planName: String(row.plan_name),
    price: n(row.price),
    startDate: String(row.start_date),
    expiryDate: expiry,
    status,
    daysRemaining: remaining,
  };
}

async function listTenants(userId: string): Promise<Tenant[]> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select id, name, code, contact_name, phone, email, status, created_at::text
    from dcm_tenants where user_id = ${userId} order by created_at asc`;
  return rows.map(mapTenant);
}

async function refreshSubscriptionStatus(userId: string, tenantId: string) {
  const sql = await getSql();
  const today = todayISO();
  await sql`
    update dcm_subscriptions
    set status = 'EXPIRED'
    where user_id = ${userId}
      and tenant_id = ${tenantId}
      and status = 'ACTIVE'
      and expiry_date < ${today}`;
}

async function ensureWorkspace(userId: string): Promise<{ tenantId: string }> {
  const sql = await getSql();
  const today = todayISO();

  let tenants = await listTenants(userId);
  if (tenants.length === 0) {
    const tenantId = crypto.randomUUID();
    const code = `T${today.replaceAll("-", "").slice(2)}`;
    await sql`
      insert into dcm_tenants (id, user_id, name, code, contact_name, status)
      values (${tenantId}, ${userId}, ${"บริษัท เงินวัน จำกัด"}, ${code}, ${"ผู้ดูแลระบบ"}, ${"ACTIVE"})`;
    const subId = crypto.randomUUID();
    const expiry = addMonthsMinusDay(today, 1);
    await sql`
      insert into dcm_subscriptions (id, user_id, tenant_id, plan_name, price, start_date, expiry_date, status)
      values (${subId}, ${userId}, ${tenantId}, ${"Standard"}, ${5000}, ${today}, ${expiry}, ${"ACTIVE"})`;
    await sql`
      insert into dcm_profiles (user_id, active_tenant_id)
      values (${userId}, ${tenantId})
      on conflict (user_id) do update set active_tenant_id = excluded.active_tenant_id`;
    await seedDemo(userId, tenantId, today);
    return { tenantId };
  }

  const profiles = await sql<{ active_tenant_id: string | null }>`
    select active_tenant_id from dcm_profiles where user_id = ${userId}`;
  let tenantId = profiles[0]?.active_tenant_id ?? tenants[0]!.id;
  if (!tenants.some((t) => t.id === tenantId)) tenantId = tenants[0]!.id;
  if (!profiles[0]) {
    await sql`insert into dcm_profiles (user_id, active_tenant_id) values (${userId}, ${tenantId})`;
  }

  const subs = await sql`
    select id from dcm_subscriptions where user_id = ${userId} and tenant_id = ${tenantId} limit 1`;
  if (subs.length === 0) {
    const expiry = addMonthsMinusDay(today, 1);
    await sql`
      insert into dcm_subscriptions (id, user_id, tenant_id, plan_name, price, start_date, expiry_date, status)
      values (${crypto.randomUUID()}, ${userId}, ${tenantId}, ${"Standard"}, ${5000}, ${today}, ${expiry}, ${"ACTIVE"})`;
  }

  await refreshSubscriptionStatus(userId, tenantId);
  return { tenantId };
}

async function seedDemo(userId: string, tenantId: string, today: string) {
  const sql = await getSql();
  const customers = [
    { code: "C001", name: "ร้านข้าวมันไก่สมชาย", phone: "0812340001", address: "ลาดพร้าว กรุงเทพฯ" },
    { code: "C002", name: "ก๋วยเตี๋ยวเรือนายวิชัย", phone: "0891112233", address: "บางกะปิ กรุงเทพฯ" },
    { code: "C003", name: "หจก. สว่างการค้า", phone: "022345678", address: "รามอินทรา กรุงเทพฯ" },
    { code: "C004", name: "ร้านกาแฟต้นไม้", phone: "0865551212", address: "อารีย์ กรุงเทพฯ" },
    { code: "C005", name: "บจก. พัฒนาทรัพย์", phone: "0918887766", address: "พระราม 9 กรุงเทพฯ" },
    { code: "C006", name: "ตลาดสดแม่ศรี", phone: "0832224455", address: "มีนบุรี กรุงเทพฯ" },
  ];
  const ids: string[] = [];
  for (const c of customers) {
    const id = crypto.randomUUID();
    ids.push(id);
    await sql`
      insert into dcm_customers (id, user_id, tenant_id, customer_code, name, phone, address, status)
      values (${id}, ${userId}, ${tenantId}, ${c.code}, ${c.name}, ${c.phone}, ${c.address}, ${"ACTIVE"})`;
  }

  const methods = ["CASH", "BANK_TRANSFER", "QR_CODE"] as const;
  const collectors = ["สมชาย", "วิชัย", "กมล"];
  const amounts = [500, 750, 1000, 1200, 1500, 2000, 2500, 3200, 4500, 800];
  for (let dayOffset = 0; dayOffset < 12; dayOffset++) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - dayOffset);
    const date = d.toISOString().slice(0, 10);
    const count = dayOffset === 0 ? 6 : 3 + (dayOffset % 3);
    for (let i = 0; i < count; i++) {
      const cid = ids[(dayOffset + i) % ids.length]!;
      const amount = amounts[(dayOffset * 3 + i) % amounts.length]!;
      const method = methods[(dayOffset + i) % methods.length]!;
      const collector = collectors[(i + dayOffset) % collectors.length]!;
      await sql`
        insert into dcm_collections
          (id, user_id, tenant_id, customer_id, collection_date, amount, payment_method, collector_name, note)
        values (
          ${crypto.randomUUID()}, ${userId}, ${tenantId}, ${cid}, ${date},
          ${amount}, ${method}, ${collector}, ${null}
        )`;
    }
  }
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardData> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const today = todayISO();
    const monthStart = `${today.slice(0, 7)}-01`;

    const tenants = await listTenants(context.userId);
    const tenant = tenants.find((t) => t.id === tenantId) ?? tenants[0]!;

    const subRows = await sql<Record<string, unknown>>`
      select id, tenant_id, plan_name, price, start_date, expiry_date, status
      from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
    const subscription = mapSub(subRows[0]!, today);

    const todayAgg = await sql<{ total: string; n: number }>`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${today}`;
    const monthAgg = await sql<{ total: string; n: number }>`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${monthStart} and collection_date <= ${today}`;
    const todayByMethod = await sql<{ method: string; total: string; n: number }>`
      select payment_method as method, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${today}
      group by payment_method`;
    const recentRows = await sql<Record<string, unknown>>`
      select c.id, c.customer_id, cu.name as customer_name, c.collection_date, c.amount,
             c.payment_method, c.collector_name, c.note, c.created_at::text
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
      order by c.collection_date desc, c.created_at desc
      limit 8`;
    const pending = await sql<{ n: number }>`
      select count(*)::int as n from dcm_payments
      where user_id = ${context.userId} and tenant_id = ${tenantId} and status = 'PENDING'`;

    return {
      tenant,
      tenants,
      subscription,
      todayAmount: n(todayAgg[0]?.total),
      todayCount: todayAgg[0]?.n ?? 0,
      monthAmount: n(monthAgg[0]?.total),
      monthCount: monthAgg[0]?.n ?? 0,
      todayByMethod: todayByMethod.map((r) => ({
        method: r.method,
        amount: n(r.total),
        count: r.n,
      })),
      recent: recentRows.map((r) => ({
        id: String(r.id),
        customerId: String(r.customer_id),
        customerName: String(r.customer_name),
        collectionDate: String(r.collection_date),
        amount: n(r.amount),
        paymentMethod: r.payment_method as Collection["paymentMethod"],
        collectorName: (r.collector_name as string) ?? null,
        note: (r.note as string) ?? null,
        createdAt: String(r.created_at),
      })),
      pendingPayments: pending[0]?.n ?? 0,
      locked: subscription.status !== "ACTIVE",
    };
  });

export const switchTenant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { tenantId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql`
      select id from dcm_tenants where id = ${data.tenantId} and user_id = ${context.userId}`;
    if (!rows[0]) throw new Error("ไม่พบองค์กร");
    await sql`
      insert into dcm_profiles (user_id, active_tenant_id)
      values (${context.userId}, ${data.tenantId})
      on conflict (user_id) do update set active_tenant_id = excluded.active_tenant_id`;
    await auditLog({
      userId: context.userId, tenantId: data.tenantId, action: "tenant_switched", entity: "profile",
      newData: { activeTenantId: data.tenantId },
    });
    return { ok: true };
  });

export const createTenant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name: string; contactName?: string; phone?: string }) => d)
  .handler(async ({ context, data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("กรุณากรอกชื่อองค์กร");
    const sql = await getSql();
    const today = todayISO();
    const id = crypto.randomUUID();
    const code = `T${Date.now().toString().slice(-6)}`;
    await sql`
      insert into dcm_tenants (id, user_id, name, code, contact_name, phone, status)
      values (${id}, ${context.userId}, ${name}, ${code}, ${data.contactName || null}, ${data.phone || null}, ${"ACTIVE"})`;
    const expiry = addMonthsMinusDay(today, 1);
    await sql`
      insert into dcm_subscriptions (id, user_id, tenant_id, plan_name, price, start_date, expiry_date, status)
      values (${crypto.randomUUID()}, ${context.userId}, ${id}, ${"Standard"}, ${5000}, ${today}, ${expiry}, ${"ACTIVE"})`;
    await sql`
      insert into dcm_profiles (user_id, active_tenant_id)
      values (${context.userId}, ${id})
      on conflict (user_id) do update set active_tenant_id = excluded.active_tenant_id`;
    await auditLog({
      userId: context.userId,
      tenantId: id,
      action: "tenant_created",
      entity: "tenant",
      entityId: id,
      newData: { name, code, contactName: data.contactName, phone: data.phone },
    });
    return { id };
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Customer[]> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const rows = await sql<Record<string, unknown>>`
      select cu.id, cu.customer_code, cu.name, cu.phone, cu.address, cu.status, cu.created_at::text,
             coalesce(sum(col.amount),0)::text as total_amount,
             count(col.id)::int as total_count
      from dcm_customers cu
      left join dcm_collections col
        on col.customer_id = cu.id and col.user_id = cu.user_id
      where cu.user_id = ${context.userId} and cu.tenant_id = ${tenantId}
      group by cu.id
      order by cu.created_at desc`;
    return rows.map((r) => ({
      id: String(r.id),
      customerCode: (r.customer_code as string) ?? null,
      name: String(r.name),
      phone: (r.phone as string) ?? null,
      address: (r.address as string) ?? null,
      status: String(r.status),
      createdAt: String(r.created_at),
      totalAmount: n(r.total_amount),
      totalCount: n(r.total_count),
    }));
  });

export const saveCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      id?: string;
      name: string;
      customerCode?: string;
      phone?: string;
      address?: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("กรุณากรอกชื่อลูกค้า");
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    if (data.id) {
      await sql`
        update dcm_customers
        set name = ${name},
            customer_code = ${data.customerCode?.trim() || null},
            phone = ${data.phone?.trim() || null},
            address = ${data.address?.trim() || null}
        where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
      await auditLog({
        userId: context.userId, tenantId, action: "update", entity: "customer",
        entityId: data.id, newData: { name, customerCode: data.customerCode, phone: data.phone, address: data.address },
      });
      return { id: data.id };
    }
    const id = crypto.randomUUID();
    await sql`
      insert into dcm_customers (id, user_id, tenant_id, customer_code, name, phone, address, status)
      values (
        ${id}, ${context.userId}, ${tenantId},
        ${data.customerCode?.trim() || null}, ${name},
        ${data.phone?.trim() || null}, ${data.address?.trim() || null}, ${"ACTIVE"}
      )`;
    await auditLog({
      userId: context.userId, tenantId, action: "create", entity: "customer",
      entityId: id, newData: { name, customerCode: data.customerCode, phone: data.phone, address: data.address },
    });
    return { id };
  });

export const disableCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    await sql`
      update dcm_customers set status = 'DISABLED'
      where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    await auditLog({
      userId: context.userId, tenantId, action: "update", entity: "customer",
      entityId: data.id, newData: { status: "DISABLED" },
    });
    return { ok: true };
  });

export const listCollections = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d?: { dateFrom?: string; dateTo?: string; customerId?: string }) => d ?? {})
  .handler(async ({ context, data }): Promise<Collection[]> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const from = data.dateFrom || "2000-01-01";
    const to = data.dateTo || "2100-01-01";
    const customerId = data.customerId || null;
    const rows = await sql<Record<string, unknown>>`
      select c.id, c.customer_id, cu.name as customer_name, c.collection_date, c.amount,
             c.payment_method, c.collector_name, c.note, c.created_at::text
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
        and c.collection_date >= ${from} and c.collection_date <= ${to}
        and (${customerId}::text is null or c.customer_id = ${customerId})
      order by c.collection_date desc, c.created_at desc
      limit 200`;
    return rows.map((r) => ({
      id: String(r.id),
      customerId: String(r.customer_id),
      customerName: String(r.customer_name),
      collectionDate: String(r.collection_date),
      amount: n(r.amount),
      paymentMethod: r.payment_method as Collection["paymentMethod"],
      collectorName: (r.collector_name as string) ?? null,
      note: (r.note as string) ?? null,
      createdAt: String(r.created_at),
    }));
  });

export const saveCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      id?: string;
      customerId: string;
      collectionDate: string;
      amount: number;
      paymentMethod: string;
      collectorName?: string;
      note?: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    if (!data.customerId) throw new Error("กรุณาเลือกลูกค้า");
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("จำนวนเงินต้องมากกว่า 0");
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    await refreshSubscriptionStatus(context.userId, tenantId);
    const sub = await sql<{ status: string }>`
      select status from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
    if (sub[0]?.status !== "ACTIVE") throw new Error("สิทธิ์การใช้งานหมดอายุ กรุณาชำระค่าบริการ");
    const cust = await sql`
      select id from dcm_customers
      where id = ${data.customerId} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    if (!cust[0]) throw new Error("ไม่พบลูกค้า");
    if (data.id) {
      await sql`
        update dcm_collections
        set customer_id = ${data.customerId},
            collection_date = ${data.collectionDate},
            amount = ${data.amount},
            payment_method = ${data.paymentMethod},
            collector_name = ${data.collectorName?.trim() || null},
            note = ${data.note?.trim() || null}
        where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
      await auditLog({
        userId: context.userId, tenantId, action: "update", entity: "collection",
        entityId: data.id, newData: { customerId: data.customerId, collectionDate: data.collectionDate, amount: data.amount, paymentMethod: data.paymentMethod },
      });
      return { id: data.id };
    }
    const id = crypto.randomUUID();
    await sql`
      insert into dcm_collections
        (id, user_id, tenant_id, customer_id, collection_date, amount, payment_method, collector_name, note)
      values (
        ${id}, ${context.userId}, ${tenantId}, ${data.customerId}, ${data.collectionDate},
        ${data.amount}, ${data.paymentMethod}, ${data.collectorName?.trim() || null}, ${data.note?.trim() || null}
      )`;
    await auditLog({
      userId: context.userId, tenantId, action: "create", entity: "collection",
      entityId: id, newData: { customerId: data.customerId, collectionDate: data.collectionDate, amount: data.amount, paymentMethod: data.paymentMethod },
    });
    return { id };
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    // Fetch old data before delete for audit trail
    const oldRow = await sql<Record<string, unknown>>`
      select id, customer_id, collection_date, amount, payment_method
      from dcm_collections where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    await sql`
      delete from dcm_collections
      where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    if (oldRow[0]) {
      await auditLog({
        userId: context.userId, tenantId, action: "delete", entity: "collection",
        entityId: data.id, oldData: oldRow[0] as Record<string, unknown>,
      });
    }
    return { ok: true };
  });

export const getDailyReport = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { date: string }) => d)
  .handler(async ({ context, data }): Promise<DailyReport> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const date = data.date;
    const agg = await sql<{ total: string; n: number }>`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${date}`;
    const byMethod = await sql<{ method: string; total: string; n: number }>`
      select payment_method as method, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${date}
      group by payment_method`;
    const itemRows = await sql<Record<string, unknown>>`
      select c.id, c.customer_id, cu.name as customer_name, c.collection_date, c.amount,
             c.payment_method, c.collector_name, c.note, c.created_at::text
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
        and c.collection_date = ${date}
      order by c.created_at desc`;
    const items: Collection[] = itemRows.map((r) => ({
      id: String(r.id),
      customerId: String(r.customer_id),
      customerName: String(r.customer_name),
      collectionDate: String(r.collection_date),
      amount: n(r.amount),
      paymentMethod: r.payment_method as Collection["paymentMethod"],
      collectorName: (r.collector_name as string) ?? null,
      note: (r.note as string) ?? null,
      createdAt: String(r.created_at),
    }));
    return {
      date,
      totalAmount: n(agg[0]?.total),
      totalCount: agg[0]?.n ?? 0,
      byMethod: byMethod.map((r) => ({ method: r.method, amount: n(r.total), count: r.n })),
      items,
    };
  });

export const getMonthlyReport = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { year: number; month: number }) => d)
  .handler(async ({ context, data }): Promise<MonthlyReport> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const month = String(data.month).padStart(2, "0");
    const from = `${data.year}-${month}-01`;
    const last = new Date(Date.UTC(data.year, data.month, 0)).getUTCDate();
    const to = `${data.year}-${month}-${String(last).padStart(2, "0")}`;
    const agg = await sql<{ total: string; n: number }>`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${from} and collection_date <= ${to}`;
    const byMethod = await sql<{ method: string; total: string; n: number }>`
      select payment_method as method, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${from} and collection_date <= ${to}
      group by payment_method`;
    const byDay = await sql<{ date: string; total: string; n: number }>`
      select collection_date as date, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${from} and collection_date <= ${to}
      group by collection_date
      order by collection_date`;
    const top = await sql<{ name: string; total: string; n: number }>`
      select cu.name, coalesce(sum(c.amount),0)::text as total, count(c.id)::int as n
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
        and c.collection_date >= ${from} and c.collection_date <= ${to}
      group by cu.name
      order by sum(c.amount) desc
      limit 5`;
    return {
      year: data.year,
      month: data.month,
      totalAmount: n(agg[0]?.total),
      totalCount: agg[0]?.n ?? 0,
      byMethod: byMethod.map((r) => ({ method: r.method, amount: n(r.total), count: r.n })),
      byDay: byDay.map((r) => ({ date: r.date, amount: n(r.total), count: r.n })),
      topCustomers: top.map((r) => ({ name: r.name, amount: n(r.total), count: r.n })),
    };
  });

export const getBilling = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{
    subscription: Subscription;
    invoices: Invoice[];
    payments: Payment[];
    locked: boolean;
  }> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    await refreshSubscriptionStatus(context.userId, tenantId);
    const today = todayISO();
    const subRows = await sql<Record<string, unknown>>`
      select id, tenant_id, plan_name, price, start_date, expiry_date, status
      from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
    const subscription = mapSub(subRows[0]!, today);
    const invoices = await sql<Record<string, unknown>>`
      select id, invoice_number, amount, due_date, status, created_at::text
      from dcm_invoices
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc`;
    const payments = await sql<Record<string, unknown>>`
      select id, invoice_id, amount, payment_method, payment_reference, status, note, created_at::text
      from dcm_payments
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc`;
    return {
      subscription,
      invoices: invoices.map((r) => ({
        id: String(r.id),
        invoiceNumber: String(r.invoice_number),
        amount: n(r.amount),
        dueDate: (r.due_date as string) ?? null,
        status: r.status as Invoice["status"],
        createdAt: String(r.created_at),
      })),
      payments: payments.map((r) => ({
        id: String(r.id),
        invoiceId: String(r.invoice_id),
        amount: n(r.amount),
        paymentMethod: (r.payment_method as string) ?? null,
        paymentReference: (r.payment_reference as string) ?? null,
        status: r.status as Payment["status"],
        note: (r.note as string) ?? null,
        createdAt: String(r.created_at),
      })),
      locked: subscription.status !== "ACTIVE",
    };
  });

export const submitPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { paymentMethod: string; paymentReference: string; note?: string }) => d)
  .handler(async ({ context, data }) => {
    const ref = data.paymentReference.trim();
    if (!ref) throw new Error("กรุณากรอกเลขที่อ้างอิงการโอน");
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const sub = await sql<Record<string, unknown>>`
      select id, price from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
    if (!sub[0]) throw new Error("ไม่พบแพ็กเกจ");
    const amount = n(sub[0].price);
    let invoice = await sql<{ id: string }>`
      select id from dcm_invoices
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and subscription_id = ${String(sub[0].id)} and status = 'PENDING'
      order by created_at desc limit 1`;
    if (!invoice[0]) {
      const invoiceId = crypto.randomUUID();
      const num = `INV-${todayISO().replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;
      await sql`
        insert into dcm_invoices (id, user_id, tenant_id, subscription_id, invoice_number, amount, due_date, status)
        values (${invoiceId}, ${context.userId}, ${tenantId}, ${String(sub[0].id)}, ${num}, ${amount}, ${todayISO()}, ${"PENDING"})`;
      invoice = [{ id: invoiceId }];
    }
    const payId = crypto.randomUUID();
    await sql`
      insert into dcm_payments (id, user_id, tenant_id, invoice_id, amount, payment_method, payment_reference, status, note)
      values (
        ${payId}, ${context.userId}, ${tenantId}, ${invoice[0]!.id}, ${amount},
        ${data.paymentMethod}, ${ref}, ${"PENDING"}, ${data.note?.trim() || null}
      )`;
    await sql`
      update dcm_subscriptions set status = 'PENDING_PAYMENT'
      where id = ${String(sub[0].id)} and user_id = ${context.userId} and status = 'EXPIRED'`;
    await auditLog({
      userId: context.userId, tenantId, action: "payment_recorded", entity: "payment",
      entityId: payId, newData: { amount, paymentMethod: data.paymentMethod, paymentReference: ref, invoiceId: invoice[0]!.id },
    });
    return { id: payId };
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { paymentId: string; reject?: boolean }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const pay = await sql<Record<string, unknown>>`
      select id, invoice_id, status from dcm_payments
      where id = ${data.paymentId} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    if (!pay[0]) throw new Error("ไม่พบรายการชำระ");
    if (String(pay[0].status) !== "PENDING") throw new Error("รายการนี้ดำเนินการแล้ว");
    if (data.reject) {
      await sql`
        update dcm_payments set status = 'REJECTED'
        where id = ${data.paymentId} and user_id = ${context.userId}`;
      await auditLog({
        userId: context.userId, tenantId, action: "payment_rejected", entity: "payment",
        entityId: data.paymentId, oldData: { status: "PENDING" }, newData: { status: "REJECTED" },
      });
      return { ok: true };
    }
    const today = todayISO();
    await sql`
      update dcm_payments set status = 'CONFIRMED'
      where id = ${data.paymentId} and user_id = ${context.userId}`;
    await sql`
      update dcm_invoices set status = 'PAID'
      where id = ${String(pay[0].invoice_id)} and user_id = ${context.userId}`;
    const sub = await sql<{ id: string; expiry_date: string }>`
      select id, expiry_date from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
    if (sub[0]) {
      const base = sub[0].expiry_date >= today ? sub[0].expiry_date : today;
      const start = sub[0].expiry_date >= today
        ? (() => {
            const d = new Date(`${sub[0].expiry_date}T00:00:00Z`);
            d.setUTCDate(d.getUTCDate() + 1);
            return d.toISOString().slice(0, 10);
          })()
        : today;
      const expiry = addMonthsMinusDay(start, 1);
      void base;
      await sql`
        update dcm_subscriptions
        set start_date = ${start}, expiry_date = ${expiry}, status = 'ACTIVE'
        where id = ${sub[0].id} and user_id = ${context.userId}`;
      await auditLog({
        userId: context.userId, tenantId, action: "subscription_extended", entity: "subscription",
        entityId: sub[0].id, newData: { startDate: start, expiryDate: expiry, status: "ACTIVE" },
      });
    }
    await auditLog({
      userId: context.userId, tenantId, action: "payment_confirmed", entity: "payment",
      entityId: data.paymentId, oldData: { status: "PENDING" }, newData: { status: "CONFIRMED" },
    });
    return { ok: true };
  });

export type MethodBreakdownPublic = MethodBreakdown;

// ── Account / Loan helpers ───────────────────────────────────────

function mapAccount(row: Record<string, unknown>, customerName: string): Account {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    customerName,
    accountNumber: String(row.account_number),
    accountType: row.account_type as Account["accountType"],
    originalAmount: n(row.original_amount),
    interestRate: n(row.interest_rate),
    currency: String(row.currency ?? "THB"),
    termMonths: row.term_months != null ? Number(row.term_months) : null,
    paymentFrequency: String(row.payment_frequency ?? "MONTHLY"),
    disbursementDate: String(row.disbursement_date),
    firstDueDate: (row.first_due_date as string) ?? null,
    maturityDate: (row.maturity_date as string) ?? null,
    outstandingBalance: n(row.outstanding_balance),
    totalPaid: n(row.total_paid),
    status: row.status as Account["status"],
    classification: (row.classification as Classification) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: String(row.created_at),
  };
}

function mapInstallment(row: Record<string, unknown>): Installment {
  return {
    id: String(row.id),
    accountId: String(row.account_id),
    installmentNumber: Number(row.installment_number),
    principalAmount: n(row.principal_amount),
    interestAmount: n(row.interest_amount),
    totalAmount: n(row.total_amount),
    dueDate: String(row.due_date),
    paidDate: (row.paid_date as string) ?? null,
    amountPaid: n(row.amount_paid),
    penaltyAmount: n(row.penalty_amount),
    status: row.status as InstallmentStatus,
  };
}

function nextAccountNumber(): string {
  const y = new Date().getFullYear();
  const seq = String(Date.now()).slice(-6);
  return `ACC-${y}-${seq}`;
}

/** Generate installment schedule based on term and frequency. */
function generateInstallments(
  accountId: string,
  userId: string,
  tenantId: string,
  totalAmount: number,
  termMonths: number,
  firstDueDate: string,
): Array<{
  id: string;
  userId: string;
  tenantId: string;
  accountId: string;
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  dueDate: string;
  status: string;
}> {
  const installments = [];
  const monthlyPrincipal = totalAmount / termMonths;
  const today = todayISO();

  for (let i = 1; i <= termMonths; i++) {
    const due = new Date(`${firstDueDate}T00:00:00Z`);
    due.setUTCMonth(due.getUTCMonth() + (i - 1));
    const dueDate = due.toISOString().slice(0, 10);
    // Auto-mark installments whose due date has passed
    const status = dueDate < today ? "OVERDUE" : "PENDING";
    installments.push({
      id: crypto.randomUUID(),
      userId,
      tenantId,
      accountId,
      installmentNumber: i,
      principalAmount: Math.round(monthlyPrincipal * 100) / 100,
      interestAmount: 0,
      totalAmount: Math.round(monthlyPrincipal * 100) / 100,
      dueDate,
      status,
    });
  }
  return installments;
}

// ── Account server functions ─────────────────────────────────────

export const listAccounts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Account[]> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const rows = await sql<Record<string, unknown>>`
      select a.*, cu.name as customer_name
      from dcm_accounts a
      join dcm_customers cu on cu.id = a.customer_id
      where a.user_id = ${context.userId} and a.tenant_id = ${tenantId}
      order by a.created_at desc`;
    return rows.map((r) => mapAccount(r, String(r.customer_name)));
  });

export const getAccountSummary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccountSummary> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const rows = await sql<Record<string, unknown>>`
      select
        count(*)::int as total,
        count(*) filter (where status = 'ACTIVE')::int as active,
        count(*) filter (where status in ('OVERDUE','DELINQUENT'))::int as overdue,
        coalesce(sum(original_amount),0)::text as original,
        coalesce(sum(outstanding_balance),0)::text as outstanding,
        coalesce(sum(total_paid),0)::text as paid
      from dcm_accounts
      where user_id = ${context.userId} and tenant_id = ${tenantId}`;
    const r = rows[0]!;
    return {
      totalAccounts: Number(r.total),
      activeAccounts: Number(r.active),
      overdueAccounts: Number(r.overdue),
      totalOutstanding: n(r.outstanding ?? r.original),
      totalOriginal: n(r.original),
      totalPaid: n(r.paid),
    };
  });

export const getAccountInstallments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { accountId: string }) => d)
  .handler(async ({ context, data }): Promise<Installment[]> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const rows = await sql<Record<string, unknown>>`
      select * from dcm_installments
      where user_id = ${context.userId} and tenant_id = ${tenantId} and account_id = ${data.accountId}
      order by installment_number`;
    return rows.map(mapInstallment);
  });

export const saveAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      id?: string;
      customerId: string;
      accountType?: AccountType;
      originalAmount: number;
      interestRate?: number;
      termMonths?: number;
      paymentFrequency?: string;
      disbursementDate: string;
      firstDueDate?: string;
      notes?: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    if (!data.customerId) throw new Error("กรุณาเลือกลูกค้า");
    if (!Number.isFinite(data.originalAmount) || data.originalAmount <= 0)
      throw new Error("จำนวนเงินต้นต้องมากกว่า 0");
    if (!data.termMonths || data.termMonths < 1)
      throw new Error("กำหนดระยะเวลาผ่อนชำระอย่างน้อย 1 เดือน");

    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);

    // Verify customer exists
    const cust = await sql`
      select id from dcm_customers
      where id = ${data.customerId} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    if (!cust[0]) throw new Error("ไม่พบลูกค้า");

    const today = todayISO();
    const firstDue = data.firstDueDate || today;

    if (data.id) {
      // Update existing account
      await sql`
        update dcm_accounts
        set account_type = ${data.accountType ?? "PERSONAL_LOAN"},
            interest_rate = ${data.interestRate ?? 0},
            term_months = ${data.termMonths},
            payment_frequency = ${data.paymentFrequency ?? "MONTHLY"},
            first_due_date = ${firstDue},
            notes = ${data.notes?.trim() || null},
            updated_at = now()
        where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
      await auditLog({
        userId: context.userId, tenantId, action: "update", entity: "account",
        entityId: data.id, newData: { accountType: data.accountType, interestRate: data.interestRate, termMonths: data.termMonths },
      });
      return { id: data.id };
    }

    // Create new account
    const accountId = crypto.randomUUID();
    const accountNumber = nextAccountNumber();
    await sql`
      insert into dcm_accounts
        (id, user_id, tenant_id, customer_id, account_number, account_type,
         original_amount, interest_rate, currency, term_months, payment_frequency,
         disbursement_date, first_due_date, outstanding_balance, total_paid, status)
      values (
        ${accountId}, ${context.userId}, ${tenantId}, ${data.customerId},
        ${accountNumber}, ${data.accountType ?? "PERSONAL_LOAN"},
        ${data.originalAmount}, ${data.interestRate ?? 0}, ${"THB"}, ${data.termMonths},
        ${data.paymentFrequency ?? "MONTHLY"}, ${data.disbursementDate}, ${firstDue},
        ${data.originalAmount}, ${0}, ${"ACTIVE"}
      )`;

    // Generate installment schedule
    const installments = generateInstallments(
      accountId, context.userId, tenantId,
      data.originalAmount, data.termMonths, firstDue,
    );      for (const inst of installments) {
        await sql`
          insert into dcm_installments
            (id, user_id, tenant_id, account_id, installment_number,
             principal_amount, interest_amount, total_amount, due_date, status)
          values (
            ${inst.id}, ${inst.userId}, ${inst.tenantId}, ${inst.accountId},
            ${inst.installmentNumber}, ${inst.principalAmount}, ${inst.interestAmount},
          ${inst.totalAmount}, ${inst.dueDate}, ${inst.status}
        )`;
    }

    await auditLog({
      userId: context.userId, tenantId, action: "create", entity: "account",
      entityId: accountId, newData: { accountNumber, accountType: data.accountType, originalAmount: data.originalAmount, termMonths: data.termMonths, customerId: data.customerId },
    });
    return { id: accountId };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    // Check if any installments are paid
    const paid = await sql<{ n: number }>`
      select count(*)::int as n from dcm_installments
      where account_id = ${data.id} and user_id = ${context.userId}
        and status in ('PAID', 'PARTIAL')`;
    if ((paid[0]?.n ?? 0) > 0) {
      throw new Error("ไม่สามารถลบบัญชีที่มีการชำระแล้วได้");
    }
    // Fetch old data before delete for audit trail
    const oldRow = await sql<Record<string, unknown>>`
      select id, account_number, account_type, original_amount, outstanding_balance, customer_id
      from dcm_accounts where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    await sql`
      delete from dcm_accounts
      where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
    if (oldRow[0]) {
      await auditLog({
        userId: context.userId, tenantId, action: "delete", entity: "account",
        entityId: data.id, oldData: oldRow[0] as Record<string, unknown>,
      });
    }
    return { ok: true };
  });

export const recordInstallmentPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      installmentId: string;
      amount: number;
      paymentMethod?: string;
      note?: string;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    if (!Number.isFinite(data.amount) || data.amount <= 0)
      throw new Error("จำนวนเงินต้องมากกว่า 0");

    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);

    // Verify installment belongs to user
    const rows = await sql<Record<string, unknown>>`
      select i.*, a.id as account_id, a.outstanding_balance, a.original_amount, a.total_paid as acc_total_paid
      from dcm_installments i
      join dcm_accounts a on a.id = i.account_id
      where i.id = ${data.installmentId} and i.user_id = ${context.userId} and i.tenant_id = ${tenantId}`;
    if (!rows[0]) throw new Error("ไม่พบรายการผ่อนชำระ");
    const inst = rows[0];
    const instStatus = String(inst.status);
    if (instStatus === "PAID") throw new Error("รายการนี้ชำระครบแล้ว");
    if (instStatus === "WAIVED") throw new Error("รายการนี้ได้รับการยกเว้นแล้ว");

    const today = todayISO();
    const currentPaid = n(inst.amount_paid);
    const newPaid = currentPaid + data.amount;
    const instTotal = n(inst.total_amount);
    const newStatus: InstallmentStatus = newPaid >= instTotal ? "PAID" : "PARTIAL";

    // Update installment
    await sql`
      update dcm_installments
      set amount_paid = ${newPaid},
          paid_date = ${newPaid >= instTotal ? today : null},
          status = ${newStatus},
          updated_at = now()
      where id = ${data.installmentId} and user_id = ${context.userId}`;

    // Update account balance
    const account = await sql<{ outstanding_balance: string; total_paid: string }>`
      select outstanding_balance::text, total_paid::text from dcm_accounts
      where id = ${String(inst.account_id)} and user_id = ${context.userId}`;
    if (account[0]) {
      const newOutstanding = Math.max(0, n(account[0].outstanding_balance) - data.amount);
      const newTotalPaid = n(account[0].total_paid) + data.amount;
      const accountStatus = newOutstanding <= 0 ? "PAID_OFF" : "ACTIVE";
      await sql`
        update dcm_accounts
        set outstanding_balance = ${newOutstanding},
            total_paid = ${newTotalPaid},
            status = ${accountStatus},
            updated_at = now()
        where id = ${String(inst.account_id)} and user_id = ${context.userId}`;
    }

    await auditLog({
      userId: context.userId, tenantId, action: "payment_recorded", entity: "installment",
      entityId: data.installmentId,
      newData: { amount: data.amount, paymentMethod: data.paymentMethod, newStatus, accountId: String(inst.account_id) },
    });
    return { ok: true, newStatus };
  });

// ── Membership / RBAC server functions ───────────────────────────

type RoleRow = { id: string; name: string; description: string | null; permissions: string };

function mapRole(row: RoleRow): import("./rbac").Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: JSON.parse(row.permissions) as import("./rbac").Permission[],
  };
}

function mapMembership(row: Record<string, unknown>): import("./rbac").Membership {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    tenantId: String(row.tenant_id),
    roleId: String(row.role_id),
    roleName: String(row.role_name),
    invitedBy: (row.invited_by as string) ?? null,
    status: row.status as import("./rbac").MembershipStatus,
    createdAt: String(row.created_at),
  };
}

/** Get the user's membership for a tenant, including role info. */
async function getMembership(userId: string, tenantId: string) {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select m.id, m.user_id, m.tenant_id, m.role_id, r.name as role_name,
           m.invited_by, m.status, m.created_at::text
    from dcm_memberships m
    join dcm_roles r on r.id = m.role_id
    where m.user_id = ${userId} and m.tenant_id = ${tenantId} and m.status = 'ACTIVE'
    limit 1`;
  return rows[0] ? mapMembership(rows[0]) : null;
}

/** Ensure the user has an Owner membership for the tenant (auto-create for first user). */
async function ensureMembership(userId: string, tenantId: string): Promise<import("./rbac").Membership> {
  const existing = await getMembership(userId, tenantId);
  if (existing) return existing;
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into dcm_memberships (id, user_id, tenant_id, role_id, status)
    values (${id}, ${userId}, ${tenantId}, ${"role_owner"}, ${"ACTIVE"})
    on conflict (user_id, tenant_id) do nothing`;
  const created = await getMembership(userId, tenantId);
  if (!created) throw new Error("ไม่สามารถสร้างสิทธิ์สมาชิกได้");
  return created;
}

export const listRoles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<import("./rbac").Role[]> => {
    const sql = await getSql();
    const rows = await sql<RoleRow>`
      select id, name, description, permissions::text from dcm_roles order by name`;
    return rows.map(mapRole);
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<import("./rbac").MembershipWithUser[]> => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    // Ensure current user has a membership
    await ensureMembership(context.userId, tenantId);
    const rows = await sql<Record<string, unknown>>`
      select m.id, m.user_id, m.tenant_id, m.role_id, r.name as role_name,
             m.invited_by, m.status, m.created_at::text,
             u.name as user_name, u.email as user_email
      from dcm_memberships m
      join dcm_roles r on r.id = m.role_id
      left join "user" u on u.id = m.user_id
      where m.tenant_id = ${tenantId}
      order by r.name, m.created_at`;
    return rows.map((r) => ({
      ...mapMembership(r),
      userName: (r.user_name as string) ?? null,
      userEmail: (r.user_email as string) ?? null,
    }));
  });

export const addMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { email: string; roleId: string }) => d)
  .handler(async ({ context, data }) => {
    if (!data.email.trim()) throw new Error("กรุณากรอกอีเมล");
    if (!data.roleId) throw new Error("กรุณาเลือกบทบาท");
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    // Check current user has permission
    const membership = await ensureMembership(context.userId, tenantId);
    const role = await sql<{ permissions: string }>`
      select permissions::text from dcm_roles where id = ${membership.roleId}`;
    const perms = JSON.parse(role[0]?.permissions ?? "[]") as string[];
    if (!perms.includes("manage_members")) throw new Error("ไม่มีสิทธิ์จัดการสมาชิก");
    // Find user by email
    const user = await sql<{ id: string; name: string | null; email: string | null }>`
      select id, name, email from "user" where lower(email) = lower(${data.email.trim()})`;
    if (!user[0]) throw new Error("ไม่พบผู้ใช้ที่มีอีเมลนี้ กรุณาให้ผู้ใช้สมัครสมาชิกก่อน");
    const targetUserId = user[0].id;
    if (targetUserId === context.userId) throw new Error("ไม่สามารถเพิ่มตัวเองได้");
    // Check if already a member
    const existing = await sql`
      select id from dcm_memberships
      where user_id = ${targetUserId} and tenant_id = ${tenantId}`;
    if (existing[0]) throw new Error("ผู้ใช้นี้เป็นสมาชิกอยู่แล้ว");
    const id = crypto.randomUUID();
    await sql`
      insert into dcm_memberships (id, user_id, tenant_id, role_id, invited_by, status)
      values (${id}, ${targetUserId}, ${tenantId}, ${data.roleId}, ${context.userId}, ${"ACTIVE"})`;
    await auditLog({
      userId: context.userId, tenantId, action: "create", entity: "membership",
      entityId: id, newData: { targetUserId, email: data.email, roleId: data.roleId },
    });
    return { id };
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { membershipId: string; roleId: string }) => d)
  .handler(async ({ context, data }) => {
    if (!data.roleId) throw new Error("กรุณาเลือกบทบาท");
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const membership = await ensureMembership(context.userId, tenantId);
    const role = await sql<{ permissions: string }>`
      select permissions::text from dcm_roles where id = ${membership.roleId}`;
    const perms = JSON.parse(role[0]?.permissions ?? "[]") as string[];
    if (!perms.includes("manage_members")) throw new Error("ไม่มีสิทธิ์จัดการสมาชิก");
    // Cannot change own role
    const target = await sql<{ user_id: string }>`
      select user_id from dcm_memberships where id = ${data.membershipId} and tenant_id = ${tenantId}`;
    if (!target[0]) throw new Error("ไม่พบสมาชิก");
    if (target[0].user_id === context.userId) throw new Error("ไม่สามารถเปลี่ยนบทบาทตัวเองได้");
    await sql`
      update dcm_memberships set role_id = ${data.roleId}, updated_at = now()
      where id = ${data.membershipId} and tenant_id = ${tenantId}`;
    await auditLog({
      userId: context.userId, tenantId, action: "update", entity: "membership",
      entityId: data.membershipId, newData: { roleId: data.roleId },
    });
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { membershipId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { tenantId } = await ensureWorkspace(context.userId);
    const membership = await ensureMembership(context.userId, tenantId);
    const role = await sql<{ permissions: string }>`
      select permissions::text from dcm_roles where id = ${membership.roleId}`;
    const perms = JSON.parse(role[0]?.permissions ?? "[]") as string[];
    if (!perms.includes("manage_members")) throw new Error("ไม่มีสิทธิ์จัดการสมาชิก");
    const target = await sql<{ user_id: string; role_name: string }>`
      select m.user_id, r.name as role_name
      from dcm_memberships m join dcm_roles r on r.id = m.role_id
      where m.id = ${data.membershipId} and m.tenant_id = ${tenantId}`;
    if (!target[0]) throw new Error("ไม่พบสมาชิก");
    if (target[0].user_id === context.userId) throw new Error("ไม่สามารถลบตัวเองได้");
    if (target[0].role_name === "Owner") throw new Error("ไม่สามารถลบเจ้าขององค์กรได้");
    await sql`
      update dcm_memberships set status = 'DISABLED', updated_at = now()
      where id = ${data.membershipId} and tenant_id = ${tenantId}`;
    await auditLog({
      userId: context.userId, tenantId, action: "update", entity: "membership",
      entityId: data.membershipId, newData: { status: "DISABLED" },
    });
    return { ok: true };
  });