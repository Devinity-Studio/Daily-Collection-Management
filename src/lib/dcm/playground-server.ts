import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { todayISO, formatBaht } from "@/lib/format";

const PLAYGROUND_TENANT_ID = "playground-demo-tenant";
const PLAYGROUND_USER_ID = "playground-demo-user";

function n(v: unknown): number {
  const x = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
  return Number.isFinite(x) ? x : 0;
}

function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + months);
  return dt.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

async function ensurePlaygroundTenant(): Promise<string> {
  const sql = await getSql();
  const existing = await sql`select id from dcm_playground_tenants where id = ${PLAYGROUND_TENANT_ID}`;
  if (existing.length > 0) return PLAYGROUND_TENANT_ID;

  await sql`
    insert into dcm_playground_tenants (id, name, code)
    values (${PLAYGROUND_TENANT_ID}, ${"DCM Playground"}, ${"PLAYGROUND"})`;

  const staffData = [
    { id: "staff-001", name: "สมชาย รักเงิน", role: "COLLECTOR" },
    { id: "staff-002", name: "วิชัย มาเยอ", role: "COLLECTOR" },
    { id: "staff-003", name: "กมล ดีต่อใจ", role: "COLLECTOR" },
    { id: "staff-004", name: "นภา สว่างจิต", role: "LEADER" },
  ];
  for (const s of staffData) {
    await sql`
      insert into dcm_playground_staff (id, tenant_id, name, role)
      values (${s.id}, ${PLAYGROUND_TENANT_ID}, ${s.name}, ${s.role})`;
  }

  return PLAYGROUND_TENANT_ID;
}

async function seedPlaygroundDemo(): Promise<void> {
  const sql = await getSql();
  const today = todayISO();
  const tenantId = await ensurePlaygroundTenant();

  await sql`select 1`;
  const existing = await sql`select id from dcm_customers where id = ${"playground-customer-001"} and tenant_id = ${PLAYGROUND_TENANT_ID} limit 1`;
  if (existing.length > 0) return;

  const customers = [
    { id: "playground-customer-001", code: "C001", name: "ร้านข้าวมันไก่สมชาย", phone: "0812340001", address: "ลาดพร้าว กรุงเทพฯ" },
    { id: "playground-customer-002", code: "C002", name: "ก๋วยเตี๋ยวเรือนายวิชัย", phone: "0891112233", address: "บางกะปิ กรุงเทพฯ" },
    { id: "playground-customer-003", code: "C003", name: "หจก. สว่างการค้า", phone: "022345678", address: "รามอินทรา กรุงเทพฯ" },
    { id: "playground-customer-004", code: "C004", name: "ร้านกาแฟต้นไม้", phone: "0865551212", address: "อารีย์ กรุงเทพฯ" },
    { id: "playground-customer-005", code: "C005", name: "บจก. พัฒนาทรัพย์", phone: "0918887766", address: "พระราม 9 กรุงเทพฯ" },
    { id: "playground-customer-006", code: "C006", name: "ตลาดสดแม่ศรี", phone: "0832224455", address: "มีนบุรี กรุงเทพฯ" },
  ];

  for (const c of customers) {
    await sql`
      insert into dcm_customers (id, user_id, tenant_id, customer_code, name, phone, address, status)
      values (${c.id}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${c.code}, ${c.name}, ${c.phone}, ${c.address}, ${"ACTIVE"})`;
    await sql`
      insert into dcm_playground_registry (id, tenant_id, entity_type, entity_id)
      values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${"customer"}, ${c.id})`;
  }

  const accounts = [
    { id: "acc-001", customerId: "playground-customer-001", amount: 60000, term: 12, firstDue: addMonths(today, 1) },
    { id: "acc-002", customerId: "playground-customer-002", amount: 120000, term: 24, firstDue: addMonths(today, 1) },
    { id: "acc-003", customerId: "playground-customer-003", amount: 30000, term: 6, firstDue: addMonths(today, 1) },
    { id: "acc-004", customerId: "playground-customer-004", amount: 90000, term: 18, firstDue: addMonths(today, 1) },
    { id: "acc-005", customerId: "playground-customer-005", amount: 150000, term: 30, firstDue: addMonths(today, 1) },
    { id: "acc-006", customerId: "playground-customer-006", amount: 45000, term: 9, firstDue: addMonths(today, 1) },
  ];

  for (const acc of accounts) {
    const monthlyPayment = Math.round(acc.amount / acc.term);
    await sql`
      insert into dcm_accounts (id, user_id, tenant_id, customer_id, account_number, account_type, original_amount, outstanding_balance, total_paid, status, disbursement_date, first_due_date, term_months, payment_frequency)
      values (${acc.id}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${acc.customerId}, ${"ACC-" + acc.id}, ${"PERSONAL_LOAN"}, ${acc.amount}, ${acc.amount}, ${0}, ${"ACTIVE"}, ${today}, ${acc.firstDue}, ${acc.term}, ${"MONTHLY"})`;

    for (let i = 1; i <= acc.term; i++) {
      const dueDate = addMonths(acc.firstDue, i - 1);
      const isPast = dueDate < today;
      const isPaid = isPast && i <= Math.floor(acc.term * 0.3);
      await sql`
        insert into dcm_installments (id, user_id, tenant_id, account_id, installment_number, principal_amount, interest_amount, total_amount, due_date, amount_paid, status, paid_date)
        values (
          ${"inst-" + acc.id + "-" + i},
          ${PLAYGROUND_USER_ID},
          ${PLAYGROUND_TENANT_ID},
          ${acc.id},
          ${i},
          ${monthlyPayment},
          ${0},
          ${monthlyPayment},
          ${dueDate},
          ${isPaid ? monthlyPayment : 0},
          ${isPaid ? "PAID" : isPast ? "OVERDUE" : "PENDING"},
          ${isPaid ? dueDate : null}
        )`;
    }

    await sql`
      insert into dcm_playground_registry (id, tenant_id, entity_type, entity_id)
      values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${"account"}, ${acc.id})`;
  }

  const staffIds = ["staff-001", "staff-002", "staff-003"];
  for (let dayOffset = 0; dayOffset < 12; dayOffset++) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - dayOffset);
    const date = d.toISOString().slice(0, 10);
    const count = dayOffset === 0 ? 6 : 3 + (dayOffset % 3);
    for (let i = 0; i < count; i++) {
      const customerId = customers[(dayOffset + i) % customers.length]!.id;
      const amount = [500, 750, 1000, 1200, 1500, 2000][(dayOffset + i) % 6]!;
      const method = (["CASH", "BANK_TRANSFER", "QR_CODE"] as const)[(dayOffset + i) % 3]!;
      const collector = (["สมชาย", "วิชัย", "กมล"] as const)[i % 3]!;
      const collectionId = crypto.randomUUID();
      await sql`
        insert into dcm_collections (id, user_id, tenant_id, customer_id, collection_date, amount, payment_method, collector_name)
        values (${collectionId}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${customerId}, ${date}, ${amount}, ${method}, ${collector})`;
      await sql`
        insert into dcm_financial_events (id, tenant_id, event_type, collection_id, customer_id, amount, actor_name, event_date, note)
        values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${"PAYMENT"}, ${collectionId}, ${customerId}, ${amount}, ${collector}, ${date}, ${"เก็บเงินรายวัน"})`;
    }
  }

  for (const c of customers) {
    const staffId = staffIds[Math.floor(Math.random() * staffIds.length)]!;
    await sql`
      insert into dcm_assignments (id, tenant_id, customer_id, responsible_staff_id, start_date, status)
      values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${c.id}, ${staffId}, ${today}, ${"ACTIVE"})`;
  }

  const tasks = [
    { customerId: "playground-customer-001", staffId: "staff-001", amount: 5000, status: "PENDING" },
    { customerId: "playground-customer-002", staffId: "staff-001", amount: 10000, status: "IN_PROGRESS" },
    { customerId: "playground-customer-003", staffId: "staff-002", amount: 5000, status: "PAID" },
    { customerId: "playground-customer-004", staffId: "staff-002", amount: 7500, status: "PROBLEM" },
    { customerId: "playground-customer-005", staffId: "staff-003", amount: 15000, status: "PENDING" },
    { customerId: "playground-customer-006", staffId: "staff-003", amount: 5000, status: "TAKE_OVER" },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i]!;
    const taskId = "task-" + String(i + 1).padStart(3, "0");
    await sql`
      insert into dcm_daily_tasks (id, tenant_id, customer_id, staff_id, assigned_staff_id, task_date, status, amount_expected, amount_collected, collected_at)
      values (${taskId}, ${PLAYGROUND_TENANT_ID}, ${t.customerId}, ${t.staffId}, ${t.staffId}, ${today}, ${t.status}, ${t.amount}, ${t.status === "PAID" ? t.amount : t.status === "IN_PROGRESS" ? t.amount * 0.5 : 0}, ${t.status === "PAID" ? new Date().toISOString() : null})`;
  }

  await sql`
    insert into dcm_problems (id, tenant_id, customer_id, task_id, reported_by, problem_type, description, amount_involved, status)
    values (${"prob-001"}, ${PLAYGROUND_TENANT_ID}, ${"playground-customer-004"}, ${"task-004"}, ${"วิชัย"}, ${"CUSTOMER_NOT_FOUND"}, ${"ไม่พบลูกค้าที่ร้าน ปิดปรับปรุง"}, ${7500}, ${"REPORTED"})`;
}

async function resetPlaygroundDemo(): Promise<void> {
  const sql = await getSql();
  const tenantId = await ensurePlaygroundTenant();

  await sql`delete from dcm_financial_events where tenant_id = ${tenantId}`;
  await sql`delete from dcm_problems where tenant_id = ${tenantId}`;
  await sql`delete from dcm_daily_tasks where tenant_id = ${tenantId}`;
  await sql`delete from dcm_takeovers where tenant_id = ${tenantId}`;
  await sql`delete from dcm_assignments where tenant_id = ${tenantId}`;
  await sql`delete from dcm_installments where tenant_id = ${tenantId} and account_id like 'acc-%'`;
  await sql`delete from dcm_accounts where tenant_id = ${tenantId} and id like 'acc-%'`;
  await sql`delete from dcm_collections where tenant_id = ${tenantId}`;
  await sql`delete from dcm_customers where tenant_id = ${tenantId}`;
  await sql`delete from dcm_playground_registry where tenant_id = ${tenantId}`;

  await seedPlaygroundDemo();
}

export type PlaygroundDashboard = {
  tenant: { id: string; name: string; code: string };
  stats: {
    totalCustomers: number;
    activeAccounts: number;
    totalOutstanding: number;
    todayCollections: number;
    todayAmount: number;
    pendingTasks: number;
    problemsCount: number;
  };
  recentCollections: Array<{
    id: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    collectorName: string | null;
    collectionDate: string;
  }>;
  todayTasks: Array<{
    id: string;
    customerId: string;
    customerName: string;
    staffName: string;
    status: string;
    amountExpected: number;
    amountCollected: number;
  }>;
  accounts: Array<{
    id: string;
    customerId: string;
    customerName: string;
    accountNumber: string;
    originalAmount: number;
    outstandingBalance: number;
    totalPaid: number;
    status: string;
    termMonths: number;
  }>;
  staff: Array<{
    id: string;
    name: string;
    role: string;
  }>;
};

export const getPlaygroundDashboard = createServerFn({ method: "GET" })
  .handler(async (): Promise<PlaygroundDashboard> => {
    const sql = await getSql();
    const today = todayISO();
    await seedPlaygroundDemo();

    const custRows = await sql<{ count: number }>`
      select count(*)::int as count from dcm_customers where tenant_id = ${PLAYGROUND_TENANT_ID}`;
    const accRows = await sql<{ total: string; outstanding: string; paid: string }>`
      select coalesce(sum(original_amount),0)::text as total, coalesce(sum(outstanding_balance),0)::text as outstanding, coalesce(sum(total_paid),0)::text as paid
      from dcm_accounts where tenant_id = ${PLAYGROUND_TENANT_ID}`;
    const todayCollRows = await sql<{ total: string; count: number }>`
      select coalesce(sum(amount),0)::text as total, count(*)::int as count
      from dcm_collections where tenant_id = ${PLAYGROUND_TENANT_ID} and collection_date = ${today}`;
    const taskRows = await sql<{ count: number }>`
      select count(*)::int as count from dcm_daily_tasks where tenant_id = ${PLAYGROUND_TENANT_ID} and status = 'PENDING'`;
    const probRows = await sql<{ count: number }>`
      select count(*)::int as count from dcm_problems where tenant_id = ${PLAYGROUND_TENANT_ID} and status = 'REPORTED'`;

    const recentRows = await sql<Record<string, unknown>>`
      select c.id, cu.name as customer_name, c.amount, c.payment_method, c.collector_name, c.collection_date
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by c.collection_date desc, c.created_at desc
      limit 8`;

    const taskDataRows = await sql<Record<string, unknown>>`
      select t.id, t.customer_id, cu.name as customer_name, s.name as staff_name, t.status, t.amount_expected, t.amount_collected
      from dcm_daily_tasks t
      join dcm_customers cu on cu.id = t.customer_id
      join dcm_playground_staff s on s.id = t.staff_id
      where t.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by t.task_date desc
      limit 10`;

    const accDataRows = await sql<Record<string, unknown>>`
      select a.id, a.customer_id, cu.name as customer_name, a.account_number, a.original_amount, a.outstanding_balance, a.total_paid, a.status, a.term_months
      from dcm_accounts a
      join dcm_customers cu on cu.id = a.customer_id
      where a.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by a.created_at desc`;

    const staffRows = await sql<Record<string, unknown>>`
      select id, name, role from dcm_playground_staff where tenant_id = ${PLAYGROUND_TENANT_ID} and is_active = true`;

    return {
      tenant: { id: PLAYGROUND_TENANT_ID, name: "DCM Playground", code: "PLAYGROUND" },
      stats: {
        totalCustomers: custRows[0]?.count ?? 0,
        activeAccounts: accDataRows.length,
        totalOutstanding: n(accRows[0]?.outstanding),
        todayCollections: todayCollRows[0]?.count ?? 0,
        todayAmount: n(todayCollRows[0]?.total),
        pendingTasks: taskRows[0]?.count ?? 0,
        problemsCount: probRows[0]?.count ?? 0,
      },
      recentCollections: recentRows.map((r) => ({
        id: String(r.id),
        customerName: String(r.customer_name),
        amount: n(r.amount),
        paymentMethod: String(r.payment_method),
        collectorName: (r.collector_name as string) ?? null,
        collectionDate: String(r.collection_date),
      })),
      todayTasks: taskDataRows.map((r) => ({
        id: String(r.id),
        customerId: String(r.customer_id),
        customerName: String(r.customer_name),
        staffName: String(r.staff_name),
        status: String(r.status),
        amountExpected: n(r.amount_expected),
        amountCollected: n(r.amount_collected),
      })),
      accounts: accDataRows.map((r) => ({
        id: String(r.id),
        customerId: String(r.customer_id),
        customerName: String(r.customer_name),
        accountNumber: String(r.account_number),
        originalAmount: n(r.original_amount),
        outstandingBalance: n(r.outstanding_balance),
        totalPaid: n(r.total_paid),
        status: String(r.status),
        termMonths: Number(r.term_months),
      })),
      staff: staffRows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        role: String(r.role),
      })),
    };
  });

export const resetPlaygroundData = createServerFn({ method: "POST" })
  .handler(async (): Promise<{ ok: boolean }> => {
    await resetPlaygroundDemo();
    return { ok: true };
  });

export type PlaygroundCustomer = {
  id: string;
  customerCode: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  status: string;
};

export const listPlaygroundCustomers = createServerFn({ method: "GET" })
  .handler(async (): Promise<PlaygroundCustomer[]> => {
    const sql = await getSql();
    await seedPlaygroundDemo();
    const rows = await sql<Record<string, unknown>>`
      select id, customer_code, name, phone, address, status
      from dcm_customers where tenant_id = ${PLAYGROUND_TENANT_ID}
      order by created_at desc`;
    return rows.map((r) => ({
      id: String(r.id),
      customerCode: (r.customer_code as string) ?? null,
      name: String(r.name),
      phone: (r.phone as string) ?? null,
      address: (r.address as string) ?? null,
      status: String(r.status),
    }));
  });

export const createPlaygroundCustomer = createServerFn({ method: "POST" })
  .validator((d: { name: string; phone?: string; address?: string; customerCode?: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = "playground-customer-" + crypto.randomUUID().slice(0, 8);
    const code = data.customerCode || "C" + String(Date.now()).slice(-3);
    await sql`
      insert into dcm_customers (id, user_id, tenant_id, customer_code, name, phone, address, status)
      values (${id}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${code}, ${data.name}, ${data.phone || null}, ${data.address || null}, ${"ACTIVE"})`;
    await sql`
      insert into dcm_playground_registry (id, tenant_id, entity_type, entity_id)
      values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${"customer"}, ${id})`;
    return { id };
  });

export const listPlaygroundAccounts = createServerFn({ method: "GET" })
  .handler(async () => {
    const sql = await getSql();
    await seedPlaygroundDemo();
    const rows = await sql<Record<string, unknown>>`
      select a.id, a.customer_id, cu.name as customer_name, a.account_number, a.account_type, a.original_amount, a.outstanding_balance, a.total_paid, a.status, a.term_months, a.first_due_date
      from dcm_accounts a
      join dcm_customers cu on cu.id = a.customer_id
      where a.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by a.created_at desc`;
    return rows.map((r) => ({
      id: String(r.id),
      customerId: String(r.customer_id),
      customerName: String(r.customer_name),
      accountNumber: String(r.account_number),
      accountType: String(r.account_type),
      originalAmount: n(r.original_amount),
      outstandingBalance: n(r.outstanding_balance),
      totalPaid: n(r.total_paid),
      status: String(r.status),
      termMonths: Number(r.term_months),
      firstDueDate: String(r.first_due_date),
    }));
  });

export const createPlaygroundAccount = createServerFn({ method: "POST" })
  .validator((d: { customerId: string; originalAmount: number; termMonths: number; interestRate?: number }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const today = todayISO();
    const accountId = "acc-" + crypto.randomUUID().slice(0, 8);
    const accountNumber = "ACC-" + Date.now().toString().slice(-6);
    const firstDue = addMonths(today, 1);

    await sql`
      insert into dcm_accounts (id, user_id, tenant_id, customer_id, account_number, account_type, original_amount, outstanding_balance, total_paid, status, disbursement_date, first_due_date, term_months, payment_frequency, interest_rate)
      values (${accountId}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${data.customerId}, ${accountNumber}, ${"PERSONAL_LOAN"}, ${data.originalAmount}, ${data.originalAmount}, ${0}, ${"ACTIVE"}, ${today}, ${firstDue}, ${data.termMonths}, ${"MONTHLY"}, ${data.interestRate || 0})`;

    const monthlyPayment = Math.round(data.originalAmount / data.termMonths);
    for (let i = 1; i <= data.termMonths; i++) {
      const dueDate = addMonths(firstDue, i - 1);
      await sql`
        insert into dcm_installments (id, user_id, tenant_id, account_id, installment_number, principal_amount, interest_amount, total_amount, due_date, amount_paid, status)
        values (${"inst-" + accountId + "-" + i}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${accountId}, ${i}, ${monthlyPayment}, ${0}, ${monthlyPayment}, ${dueDate}, ${0}, ${"PENDING"})`;
    }

    await sql`
      insert into dcm_playground_registry (id, tenant_id, entity_type, entity_id)
      values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${"account"}, ${accountId})`;

    const staffRows = await sql<{ id: string }>`
      select id from dcm_playground_staff where tenant_id = ${PLAYGROUND_TENANT_ID} and is_active = true limit 1`;
    if (staffRows[0]) {
      await sql`
        insert into dcm_assignments (id, tenant_id, customer_id, responsible_staff_id, start_date, status)
        values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${data.customerId}, ${staffRows[0].id}, ${today}, ${"ACTIVE"})`;
    }

    return { id: accountId };
  });

export const getPlaygroundInstallments = createServerFn({ method: "GET" })
  .validator((d: { accountId: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select id, installment_number, principal_amount, interest_amount, total_amount, due_date, amount_paid, status, paid_date
      from dcm_installments
      where tenant_id = ${PLAYGROUND_TENANT_ID} and account_id = ${data.accountId}
      order by installment_number`;
    return rows.map((r) => ({
      id: String(r.id),
      installmentNumber: Number(r.installment_number),
      principalAmount: n(r.principal_amount),
      interestAmount: n(r.interest_amount),
      totalAmount: n(r.total_amount),
      dueDate: String(r.due_date),
      amountPaid: n(r.amount_paid),
      status: String(r.status),
      paidDate: (r.paid_date as string) ?? null,
    }));
  });

export const recordPlaygroundPayment = createServerFn({ method: "POST" })
  .validator((d: { installmentId: string; amount: number; paymentMethod?: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const today = todayISO();

    const rows = await sql<Record<string, unknown>>`
      select i.*, a.outstanding_balance, a.total_paid, a.id as account_id
      from dcm_installments i
      join dcm_accounts a on a.id = i.account_id
      where i.id = ${data.installmentId} and i.tenant_id = ${PLAYGROUND_TENANT_ID}`;
    if (!rows[0]) throw new Error("ไม่พบรายการผ่อนชำระ");

    const inst = rows[0];
    const newAmountPaid = n(inst.amount_paid) + data.amount;
    const totalAmount = n(inst.total_amount);
    const newStatus = newAmountPaid >= totalAmount ? "PAID" : "PARTIAL";

    await sql`
      update dcm_installments
      set amount_paid = ${newAmountPaid}, status = ${newStatus}, paid_date = ${newStatus === "PAID" ? today : null}
      where id = ${data.installmentId} and tenant_id = ${PLAYGROUND_TENANT_ID}`;

    const newOutstanding = Math.max(0, n(inst.outstanding_balance) - data.amount);
    const newTotalPaid = n(inst.total_paid) + data.amount;
    await sql`
      update dcm_accounts
      set outstanding_balance = ${newOutstanding}, total_paid = ${newTotalPaid}, status = ${newOutstanding <= 0 ? "PAID_OFF" : "ACTIVE"}
      where id = ${String(inst.account_id)} and tenant_id = ${PLAYGROUND_TENANT_ID}`;

    await sql`
      insert into dcm_financial_events (id, tenant_id, event_type, account_id, installment_id, amount, balance_before, balance_after, actor_name, event_date, note)
      values (${crypto.randomUUID()}, ${PLAYGROUND_TENANT_ID}, ${"PAYMENT"}, ${String(inst.account_id)}, ${data.installmentId}, ${data.amount}, ${inst.outstanding_balance}, ${newOutstanding}, ${"Playground User"}, ${today}, ${"ชำระเงินผ่อน"})`;

    return { ok: true };
  });

export const listPlaygroundTasks = createServerFn({ method: "GET" })
  .handler(async () => {
    const sql = await getSql();
    const today = todayISO();
    const rows = await sql<Record<string, unknown>>`
      select t.id, t.customer_id, cu.name as customer_name, s.name as staff_name, t.status, t.amount_expected, t.amount_collected, t.task_date, t.problem_id
      from dcm_daily_tasks t
      join dcm_customers cu on cu.id = t.customer_id
      join dcm_playground_staff s on s.id = t.staff_id
      where t.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by t.task_date desc, t.created_at desc`;
    return rows.map((r) => ({
      id: String(r.id),
      customerId: String(r.customer_id),
      customerName: String(r.customer_name),
      staffName: String(r.staff_name),
      status: String(r.status),
      amountExpected: n(r.amount_expected),
      amountCollected: n(r.amount_collected),
      taskDate: String(r.task_date),
      hasProblem: !!r.problem_id,
    }));
  });

export const updatePlaygroundTask = createServerFn({ method: "POST" })
  .validator((d: { taskId: string; status: string; amountCollected?: number; note?: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const today = todayISO();

    await sql`
      update dcm_daily_tasks
      set status = ${data.status},
          amount_collected = ${data.amountCollected ?? 0},
          collected_at = ${data.status === "PAID" ? new Date().toISOString() : null},
          note = ${data.note || null}
      where id = ${data.taskId} and tenant_id = ${PLAYGROUND_TENANT_ID}`;

    if (data.status === "PAID" && data.amountCollected) {
      const taskRows = await sql<{ customer_id: string }>`
        select customer_id from dcm_daily_tasks where id = ${data.taskId}`;
      if (taskRows[0]) {
        const collId = crypto.randomUUID();
        await sql`
          insert into dcm_collections (id, user_id, tenant_id, customer_id, collection_date, amount, payment_method, collector_name)
          values (${collId}, ${PLAYGROUND_USER_ID}, ${PLAYGROUND_TENANT_ID}, ${taskRows[0].customer_id}, ${today}, ${data.amountCollected}, ${"CASH"}, ${"Playground User"})`;
      }
    }

    return { ok: true };
  });

export const createPlaygroundTask = createServerFn({ method: "POST" })
  .validator((d: { customerId: string; staffId: string; amountExpected: number; taskDate: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const taskId = "task-" + crypto.randomUUID().slice(0, 8);
    await sql`
      insert into dcm_daily_tasks (id, tenant_id, customer_id, staff_id, assigned_staff_id, task_date, status, amount_expected)
      values (${taskId}, ${PLAYGROUND_TENANT_ID}, ${data.customerId}, ${data.staffId}, ${data.staffId}, ${data.taskDate}, ${"PENDING"}, ${data.amountExpected})`;
    return { id: taskId };
  });

export const reportPlaygroundProblem = createServerFn({ method: "POST" })
  .validator((d: { customerId: string; taskId?: string; problemType: string; description: string; amountInvolved?: number }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const probId = "prob-" + crypto.randomUUID().slice(0, 8);
    await sql`
      insert into dcm_problems (id, tenant_id, customer_id, task_id, reported_by, problem_type, description, amount_involved, status)
      values (${probId}, ${PLAYGROUND_TENANT_ID}, ${data.customerId}, ${data.taskId || null}, ${"Playground User"}, ${data.problemType}, ${data.description}, ${data.amountInvolved || null}, ${"REPORTED"})`;
    if (data.taskId) {
      await sql`
        update dcm_daily_tasks set status = ${"PROBLEM"}, problem_id = ${probId}
        where id = ${data.taskId} and tenant_id = ${PLAYGROUND_TENANT_ID}`;
    }
    return { id: probId };
  });

export const listPlaygroundProblems = createServerFn({ method: "GET" })
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select p.id, p.customer_id, cu.name as customer_name, p.problem_type, p.description, p.amount_involved, p.status, p.created_at
      from dcm_problems p
      join dcm_customers cu on cu.id = p.customer_id
      where p.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by p.created_at desc`;
    return rows.map((r) => ({
      id: String(r.id),
      customerId: String(r.customer_id),
      customerName: String(r.customer_name),
      problemType: String(r.problem_type),
      description: (r.description as string) ?? null,
      amountInvolved: n(r.amount_involved),
      status: String(r.status),
      createdAt: String(r.created_at),
    }));
  });

export const resolvePlaygroundProblem = createServerFn({ method: "POST" })
  .validator((d: { problemId: string; resolutionNote: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      update dcm_problems
      set status = ${"RESOLVED"}, resolved_by = ${"Playground User"}, resolved_at = ${new Date().toISOString()}, resolution_note = ${data.resolutionNote}
      where id = ${data.problemId} and tenant_id = ${PLAYGROUND_TENANT_ID}`;
    return { ok: true };
  });

export const createPlaygroundTakeover = createServerFn({ method: "POST" })
  .validator((d: { originalStaffId: string; takingStaffId: string; reason: string; startDate: string; endDate?: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const takeoverId = "takeover-" + crypto.randomUUID().slice(0, 8);
    await sql`
      insert into dcm_takeovers (id, tenant_id, original_staff_id, taking_staff_id, reason, start_date, end_date, status)
      values (${takeoverId}, ${PLAYGROUND_TENANT_ID}, ${data.originalStaffId}, ${data.takingStaffId}, ${data.reason}, ${data.startDate}, ${data.endDate || null}, ${"ACTIVE"})`;
    await sql`
      update dcm_daily_tasks set assigned_staff_id = ${data.takingStaffId}
      where staff_id = ${data.originalStaffId} and tenant_id = ${PLAYGROUND_TENANT_ID} and task_date >= ${data.startDate}`;
    return { id: takeoverId };
  });

export const getPlaygroundStaff = createServerFn({ method: "GET" })
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select id, name, role, is_active from dcm_playground_staff where tenant_id = ${PLAYGROUND_TENANT_ID}`;
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      role: String(r.role),
      isActive: Boolean(r.is_active),
    }));
  });

export const getPlaygroundFinancialEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select e.id, e.event_type, e.amount, e.balance_before, e.balance_after, e.actor_name, e.event_date, e.note, cu.name as customer_name
      from dcm_financial_events e
      left join dcm_customers cu on cu.id = e.customer_id
      where e.tenant_id = ${PLAYGROUND_TENANT_ID}
      order by e.event_date desc, e.created_at desc
      limit 50`;
    return rows.map((r) => ({
      id: String(r.id),
      eventType: String(r.event_type),
      amount: n(r.amount),
      balanceBefore: n(r.balance_before),
      balanceAfter: n(r.balance_after),
      actorName: (r.actor_name as string) ?? null,
      eventDate: String(r.event_date),
      note: (r.note as string) ?? null,
      customerName: (r.customer_name as string) ?? null,
    }));
  });

export const getPlaygroundDrillDown = createServerFn({ method: "GET" })
  .validator((d?: { level: "area" | "staff" | "customer" | "contract" | "transaction" }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const level = data?.level || "area";

    if (level === "area") {
      const byStaff = await sql<Record<string, unknown>>`
        select s.name as staff_name, s.role, count(*)::int as task_count,
               sum(t.amount_expected)::text as total_expected,
               sum(t.amount_collected)::text as total_collected
        from dcm_daily_tasks t
        join dcm_playground_staff s on s.id = t.staff_id
        where t.tenant_id = ${PLAYGROUND_TENANT_ID}
        group by s.name, s.role`;
      return {
        level: "area" as const,
        data: byStaff.map((r) => ({
          name: String(r.staff_name),
          role: String(r.role),
          taskCount: Number(r.task_count),
          totalExpected: n(r.total_expected),
          totalCollected: n(r.total_collected),
        })),
      };
    }

    if (level === "staff") {
      const byCustomer = await sql<Record<string, unknown>>`
        select cu.id, cu.name as customer_name, s.name as staff_name,
               count(*)::int as task_count, sum(t.amount_expected)::text as total_expected
        from dcm_daily_tasks t
        join dcm_customers cu on cu.id = t.customer_id
        join dcm_playground_staff s on s.id = t.staff_id
        where t.tenant_id = ${PLAYGROUND_TENANT_ID}
        group by cu.id, cu.name, s.name`;
      return {
        level: "staff" as const,
        data: byCustomer.map((r) => ({
          customerId: String(r.id),
          customerName: String(r.customer_name),
          staffName: String(r.staff_name),
          taskCount: Number(r.task_count),
          totalExpected: n(r.total_expected),
        })),
      };
    }

    return { level, data: [] };
  });
