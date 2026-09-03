import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as authMiddleware, s as todayISO } from "./format-BifKjn1T.mjs";
import { r as getSql } from "./db-BlkofHqW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-D6J7e0j_.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function n(v) {
	const x = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
	return Number.isFinite(x) ? x : 0;
}
function addMonthsMinusDay(iso, months) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCMonth(dt.getUTCMonth() + months);
	dt.setUTCDate(dt.getUTCDate() - 1);
	return dt.toISOString().slice(0, 10);
}
function daysBetween(from, to) {
	const a = (/* @__PURE__ */ new Date(`${from}T00:00:00Z`)).getTime();
	const b = (/* @__PURE__ */ new Date(`${to}T00:00:00Z`)).getTime();
	return Math.round((b - a) / 864e5);
}
function mapTenant(row) {
	return {
		id: String(row.id),
		name: String(row.name),
		code: String(row.code),
		contactName: row.contact_name ?? null,
		phone: row.phone ?? null,
		email: row.email ?? null,
		status: row.status,
		createdAt: String(row.created_at)
	};
}
function mapSub(row, today) {
	const expiry = String(row.expiry_date);
	const status = String(row.status);
	const remaining = status === "ACTIVE" ? Math.max(0, daysBetween(today, expiry)) : 0;
	return {
		id: String(row.id),
		tenantId: String(row.tenant_id),
		planName: String(row.plan_name),
		price: n(row.price),
		startDate: String(row.start_date),
		expiryDate: expiry,
		status,
		daysRemaining: remaining
	};
}
async function listTenants(userId) {
	return (await (await getSql())`
    select id, name, code, contact_name, phone, email, status, created_at::text
    from dcm_tenants where user_id = ${userId} order by created_at asc`).map(mapTenant);
}
async function refreshSubscriptionStatus(userId, tenantId) {
	await (await getSql())`
    update dcm_subscriptions
    set status = 'EXPIRED'
    where user_id = ${userId}
      and tenant_id = ${tenantId}
      and status = 'ACTIVE'
      and expiry_date < ${todayISO()}`;
}
async function ensureWorkspace(userId) {
	const sql = await getSql();
	const today = todayISO();
	let tenants = await listTenants(userId);
	if (tenants.length === 0) {
		const tenantId = crypto.randomUUID();
		await sql`
      insert into dcm_tenants (id, user_id, name, code, contact_name, status)
      values (${tenantId}, ${userId}, ${"บริษัท เงินวัน จำกัด"}, ${`T${today.replaceAll("-", "").slice(2)}`}, ${"ผู้ดูแลระบบ"}, ${"ACTIVE"})`;
		await sql`
      insert into dcm_subscriptions (id, user_id, tenant_id, plan_name, price, start_date, expiry_date, status)
      values (${crypto.randomUUID()}, ${userId}, ${tenantId}, ${"Standard"}, ${5e3}, ${today}, ${addMonthsMinusDay(today, 1)}, ${"ACTIVE"})`;
		await sql`
      insert into dcm_profiles (user_id, active_tenant_id)
      values (${userId}, ${tenantId})
      on conflict (user_id) do update set active_tenant_id = excluded.active_tenant_id`;
		await seedDemo(userId, tenantId, today);
		return { tenantId };
	}
	const profiles = await sql`
    select active_tenant_id from dcm_profiles where user_id = ${userId}`;
	let tenantId = profiles[0]?.active_tenant_id ?? tenants[0].id;
	if (!tenants.some((t) => t.id === tenantId)) tenantId = tenants[0].id;
	if (!profiles[0]) await sql`insert into dcm_profiles (user_id, active_tenant_id) values (${userId}, ${tenantId})`;
	if ((await sql`
    select id from dcm_subscriptions where user_id = ${userId} and tenant_id = ${tenantId} limit 1`).length === 0) {
		const expiry = addMonthsMinusDay(today, 1);
		await sql`
      insert into dcm_subscriptions (id, user_id, tenant_id, plan_name, price, start_date, expiry_date, status)
      values (${crypto.randomUUID()}, ${userId}, ${tenantId}, ${"Standard"}, ${5e3}, ${today}, ${expiry}, ${"ACTIVE"})`;
	}
	await refreshSubscriptionStatus(userId, tenantId);
	return { tenantId };
}
async function seedDemo(userId, tenantId, today) {
	const sql = await getSql();
	const customers = [
		{
			code: "C001",
			name: "ร้านข้าวมันไก่สมชาย",
			phone: "0812340001",
			address: "ลาดพร้าว กรุงเทพฯ"
		},
		{
			code: "C002",
			name: "ก๋วยเตี๋ยวเรือนายวิชัย",
			phone: "0891112233",
			address: "บางกะปิ กรุงเทพฯ"
		},
		{
			code: "C003",
			name: "หจก. สว่างการค้า",
			phone: "022345678",
			address: "รามอินทรา กรุงเทพฯ"
		},
		{
			code: "C004",
			name: "ร้านกาแฟต้นไม้",
			phone: "0865551212",
			address: "อารีย์ กรุงเทพฯ"
		},
		{
			code: "C005",
			name: "บจก. พัฒนาทรัพย์",
			phone: "0918887766",
			address: "พระราม 9 กรุงเทพฯ"
		},
		{
			code: "C006",
			name: "ตลาดสดแม่ศรี",
			phone: "0832224455",
			address: "มีนบุรี กรุงเทพฯ"
		}
	];
	const ids = [];
	for (const c of customers) {
		const id = crypto.randomUUID();
		ids.push(id);
		await sql`
      insert into dcm_customers (id, user_id, tenant_id, customer_code, name, phone, address, status)
      values (${id}, ${userId}, ${tenantId}, ${c.code}, ${c.name}, ${c.phone}, ${c.address}, ${"ACTIVE"})`;
	}
	const methods = [
		"CASH",
		"BANK_TRANSFER",
		"QR_CODE"
	];
	const collectors = [
		"สมชาย",
		"วิชัย",
		"กมล"
	];
	const amounts = [
		500,
		750,
		1e3,
		1200,
		1500,
		2e3,
		2500,
		3200,
		4500,
		800
	];
	for (let dayOffset = 0; dayOffset < 12; dayOffset++) {
		const d = /* @__PURE__ */ new Date(`${today}T00:00:00Z`);
		d.setUTCDate(d.getUTCDate() - dayOffset);
		const date = d.toISOString().slice(0, 10);
		const count = dayOffset === 0 ? 6 : 3 + dayOffset % 3;
		for (let i = 0; i < count; i++) {
			const cid = ids[(dayOffset + i) % ids.length];
			const amount = amounts[(dayOffset * 3 + i) % amounts.length];
			const method = methods[(dayOffset + i) % methods.length];
			const collector = collectors[(i + dayOffset) % collectors.length];
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
var getDashboard_createServerFn_handler = createServerRpc({
	id: "b190a974d7f6603d23c58b6baaf37cd801cc93a640a919666fc88a30f50985b0",
	name: "getDashboard",
	filename: "src/lib/dcm/server.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	const today = todayISO();
	const monthStart = `${today.slice(0, 7)}-01`;
	const tenants = await listTenants(context.userId);
	const tenant = tenants.find((t) => t.id === tenantId) ?? tenants[0];
	const subscription = mapSub((await sql`
      select id, tenant_id, plan_name, price, start_date, expiry_date, status
      from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`)[0], today);
	const todayAgg = await sql`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${today}`;
	const monthAgg = await sql`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${monthStart} and collection_date <= ${today}`;
	const todayByMethod = await sql`
      select payment_method as method, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${today}
      group by payment_method`;
	const recentRows = await sql`
      select c.id, c.customer_id, cu.name as customer_name, c.collection_date, c.amount,
             c.payment_method, c.collector_name, c.note, c.created_at::text
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
      order by c.collection_date desc, c.created_at desc
      limit 8`;
	const pending = await sql`
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
			count: r.n
		})),
		recent: recentRows.map((r) => ({
			id: String(r.id),
			customerId: String(r.customer_id),
			customerName: String(r.customer_name),
			collectionDate: String(r.collection_date),
			amount: n(r.amount),
			paymentMethod: r.payment_method,
			collectorName: r.collector_name ?? null,
			note: r.note ?? null,
			createdAt: String(r.created_at)
		})),
		pendingPayments: pending[0]?.n ?? 0,
		locked: subscription.status !== "ACTIVE"
	};
});
var switchTenant_createServerFn_handler = createServerRpc({
	id: "5a28f59c68c4f1397f972b9d6ca48377a4cf13c13f331998bb5bf8b1962c2dc9",
	name: "switchTenant",
	filename: "src/lib/dcm/server.ts"
}, (opts) => switchTenant.__executeServer(opts));
var switchTenant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(switchTenant_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`
      select id from dcm_tenants where id = ${data.tenantId} and user_id = ${context.userId}`)[0]) throw new Error("ไม่พบองค์กร");
	await sql`
      insert into dcm_profiles (user_id, active_tenant_id)
      values (${context.userId}, ${data.tenantId})
      on conflict (user_id) do update set active_tenant_id = excluded.active_tenant_id`;
	return { ok: true };
});
var createTenant_createServerFn_handler = createServerRpc({
	id: "79eeab338e26c1a1a77d2c857ac64190672cc972d45e0e17bd79867a94fb8073",
	name: "createTenant",
	filename: "src/lib/dcm/server.ts"
}, (opts) => createTenant.__executeServer(opts));
var createTenant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createTenant_createServerFn_handler, async ({ context, data }) => {
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
      values (${crypto.randomUUID()}, ${context.userId}, ${id}, ${"Standard"}, ${5e3}, ${today}, ${expiry}, ${"ACTIVE"})`;
	await sql`
      insert into dcm_profiles (user_id, active_tenant_id)
      values (${context.userId}, ${id})
      on conflict (user_id) do update set active_tenant_id = excluded.active_tenant_id`;
	return { id };
});
var listCustomers_createServerFn_handler = createServerRpc({
	id: "2900ea46510e863556f7c4f8dd8403e7b01085c4a4dc8cd139400be5facd77d0",
	name: "listCustomers",
	filename: "src/lib/dcm/server.ts"
}, (opts) => listCustomers.__executeServer(opts));
var listCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCustomers_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	return (await sql`
      select cu.id, cu.customer_code, cu.name, cu.phone, cu.address, cu.status, cu.created_at::text,
             coalesce(sum(col.amount),0)::text as total_amount,
             count(col.id)::int as total_count
      from dcm_customers cu
      left join dcm_collections col
        on col.customer_id = cu.id and col.user_id = cu.user_id
      where cu.user_id = ${context.userId} and cu.tenant_id = ${tenantId}
      group by cu.id
      order by cu.created_at desc`).map((r) => ({
		id: String(r.id),
		customerCode: r.customer_code ?? null,
		name: String(r.name),
		phone: r.phone ?? null,
		address: r.address ?? null,
		status: String(r.status),
		createdAt: String(r.created_at),
		totalAmount: n(r.total_amount),
		totalCount: n(r.total_count)
	}));
});
var saveCustomer_createServerFn_handler = createServerRpc({
	id: "4b4a56a699c0badff4f610c5551d47bb092263f0a210d96f7c607c912987fc5c",
	name: "saveCustomer",
	filename: "src/lib/dcm/server.ts"
}, (opts) => saveCustomer.__executeServer(opts));
var saveCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(saveCustomer_createServerFn_handler, async ({ context, data }) => {
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
	return { id };
});
var disableCustomer_createServerFn_handler = createServerRpc({
	id: "893a5a3fdb809f9e55543b1e0010932d35d6ba98fdee3b756e5115053a708943",
	name: "disableCustomer",
	filename: "src/lib/dcm/server.ts"
}, (opts) => disableCustomer.__executeServer(opts));
var disableCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(disableCustomer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	await sql`
      update dcm_customers set status = 'DISABLED'
      where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
	return { ok: true };
});
var listCollections_createServerFn_handler = createServerRpc({
	id: "606197a45c2a49d2a0ddf261aa0c003334b78158e8d7c7c4ca7ccc57c8a83c7f",
	name: "listCollections",
	filename: "src/lib/dcm/server.ts"
}, (opts) => listCollections.__executeServer(opts));
var listCollections = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d ?? {}).handler(listCollections_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	const from = data.dateFrom || "2000-01-01";
	const to = data.dateTo || "2100-01-01";
	const customerId = data.customerId || null;
	return (await sql`
      select c.id, c.customer_id, cu.name as customer_name, c.collection_date, c.amount,
             c.payment_method, c.collector_name, c.note, c.created_at::text
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
        and c.collection_date >= ${from} and c.collection_date <= ${to}
        and (${customerId}::text is null or c.customer_id = ${customerId})
      order by c.collection_date desc, c.created_at desc
      limit 200`).map((r) => ({
		id: String(r.id),
		customerId: String(r.customer_id),
		customerName: String(r.customer_name),
		collectionDate: String(r.collection_date),
		amount: n(r.amount),
		paymentMethod: r.payment_method,
		collectorName: r.collector_name ?? null,
		note: r.note ?? null,
		createdAt: String(r.created_at)
	}));
});
var saveCollection_createServerFn_handler = createServerRpc({
	id: "588f8c8a7c53fda99f2e483e84ad8ba75b7d16a4b1814d3fa00e56c79379ed61",
	name: "saveCollection",
	filename: "src/lib/dcm/server.ts"
}, (opts) => saveCollection.__executeServer(opts));
var saveCollection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(saveCollection_createServerFn_handler, async ({ context, data }) => {
	if (!data.customerId) throw new Error("กรุณาเลือกลูกค้า");
	if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("จำนวนเงินต้องมากกว่า 0");
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	await refreshSubscriptionStatus(context.userId, tenantId);
	if ((await sql`
      select status from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`)[0]?.status !== "ACTIVE") throw new Error("สิทธิ์การใช้งานหมดอายุ กรุณาชำระค่าบริการ");
	if (!(await sql`
      select id from dcm_customers
      where id = ${data.customerId} and user_id = ${context.userId} and tenant_id = ${tenantId}`)[0]) throw new Error("ไม่พบลูกค้า");
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
	return { id };
});
var deleteCollection_createServerFn_handler = createServerRpc({
	id: "078c3a39c9d2121e44f2c9565db3bb7b14d8cdb64284ad9d85286223cdc9c326",
	name: "deleteCollection",
	filename: "src/lib/dcm/server.ts"
}, (opts) => deleteCollection.__executeServer(opts));
var deleteCollection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(deleteCollection_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	await sql`
      delete from dcm_collections
      where id = ${data.id} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
	return { ok: true };
});
var getDailyReport_createServerFn_handler = createServerRpc({
	id: "aace3ce042ff1a5007f7bcee8414e6d7434d660c4e3de92d0f13ecc003c7010e",
	name: "getDailyReport",
	filename: "src/lib/dcm/server.ts"
}, (opts) => getDailyReport.__executeServer(opts));
var getDailyReport = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(getDailyReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	const date = data.date;
	const agg = await sql`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${date}`;
	const byMethod = await sql`
      select payment_method as method, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId} and collection_date = ${date}
      group by payment_method`;
	const items = (await sql`
      select c.id, c.customer_id, cu.name as customer_name, c.collection_date, c.amount,
             c.payment_method, c.collector_name, c.note, c.created_at::text
      from dcm_collections c
      join dcm_customers cu on cu.id = c.customer_id
      where c.user_id = ${context.userId} and c.tenant_id = ${tenantId}
        and c.collection_date = ${date}
      order by c.created_at desc`).map((r) => ({
		id: String(r.id),
		customerId: String(r.customer_id),
		customerName: String(r.customer_name),
		collectionDate: String(r.collection_date),
		amount: n(r.amount),
		paymentMethod: r.payment_method,
		collectorName: r.collector_name ?? null,
		note: r.note ?? null,
		createdAt: String(r.created_at)
	}));
	return {
		date,
		totalAmount: n(agg[0]?.total),
		totalCount: agg[0]?.n ?? 0,
		byMethod: byMethod.map((r) => ({
			method: r.method,
			amount: n(r.total),
			count: r.n
		})),
		items
	};
});
var getMonthlyReport_createServerFn_handler = createServerRpc({
	id: "29626d08bd505966edfde3b3a46282e3f4a19c1ffeb809275941032350fb05f0",
	name: "getMonthlyReport",
	filename: "src/lib/dcm/server.ts"
}, (opts) => getMonthlyReport.__executeServer(opts));
var getMonthlyReport = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(getMonthlyReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	const month = String(data.month).padStart(2, "0");
	const from = `${data.year}-${month}-01`;
	const last = new Date(Date.UTC(data.year, data.month, 0)).getUTCDate();
	const to = `${data.year}-${month}-${String(last).padStart(2, "0")}`;
	const agg = await sql`
      select coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${from} and collection_date <= ${to}`;
	const byMethod = await sql`
      select payment_method as method, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${from} and collection_date <= ${to}
      group by payment_method`;
	const byDay = await sql`
      select collection_date as date, coalesce(sum(amount),0)::text as total, count(*)::int as n
      from dcm_collections
      where user_id = ${context.userId} and tenant_id = ${tenantId}
        and collection_date >= ${from} and collection_date <= ${to}
      group by collection_date
      order by collection_date`;
	const top = await sql`
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
		byMethod: byMethod.map((r) => ({
			method: r.method,
			amount: n(r.total),
			count: r.n
		})),
		byDay: byDay.map((r) => ({
			date: r.date,
			amount: n(r.total),
			count: r.n
		})),
		topCustomers: top.map((r) => ({
			name: r.name,
			amount: n(r.total),
			count: r.n
		}))
	};
});
var getBilling_createServerFn_handler = createServerRpc({
	id: "941d46fdd165695d0a7cc7a815677c6352cb3622ac2e27c7ab5f93c144b56dc9",
	name: "getBilling",
	filename: "src/lib/dcm/server.ts"
}, (opts) => getBilling.__executeServer(opts));
var getBilling = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getBilling_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	await refreshSubscriptionStatus(context.userId, tenantId);
	const today = todayISO();
	const subscription = mapSub((await sql`
      select id, tenant_id, plan_name, price, start_date, expiry_date, status
      from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`)[0], today);
	const invoices = await sql`
      select id, invoice_number, amount, due_date, status, created_at::text
      from dcm_invoices
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc`;
	const payments = await sql`
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
			dueDate: r.due_date ?? null,
			status: r.status,
			createdAt: String(r.created_at)
		})),
		payments: payments.map((r) => ({
			id: String(r.id),
			invoiceId: String(r.invoice_id),
			amount: n(r.amount),
			paymentMethod: r.payment_method ?? null,
			paymentReference: r.payment_reference ?? null,
			status: r.status,
			note: r.note ?? null,
			createdAt: String(r.created_at)
		})),
		locked: subscription.status !== "ACTIVE"
	};
});
var submitPayment_createServerFn_handler = createServerRpc({
	id: "a682f5433f0847fecd7d97a02990f24be75ee7be7ac52ca9a9bbb7acd33c9f6f",
	name: "submitPayment",
	filename: "src/lib/dcm/server.ts"
}, (opts) => submitPayment.__executeServer(opts));
var submitPayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(submitPayment_createServerFn_handler, async ({ context, data }) => {
	const ref = data.paymentReference.trim();
	if (!ref) throw new Error("กรุณากรอกเลขที่อ้างอิงการโอน");
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	const sub = await sql`
      select id, price from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
	if (!sub[0]) throw new Error("ไม่พบแพ็กเกจ");
	const amount = n(sub[0].price);
	let invoice = await sql`
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
        ${payId}, ${context.userId}, ${tenantId}, ${invoice[0].id}, ${amount},
        ${data.paymentMethod}, ${ref}, ${"PENDING"}, ${data.note?.trim() || null}
      )`;
	await sql`
      update dcm_subscriptions set status = 'PENDING_PAYMENT'
      where id = ${String(sub[0].id)} and user_id = ${context.userId} and status = 'EXPIRED'`;
	return { id: payId };
});
var confirmPayment_createServerFn_handler = createServerRpc({
	id: "1174b7d1e303857dc71b794a2b526a367e1954eef96a1e9d285a23c04846d1a1",
	name: "confirmPayment",
	filename: "src/lib/dcm/server.ts"
}, (opts) => confirmPayment.__executeServer(opts));
var confirmPayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(confirmPayment_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { tenantId } = await ensureWorkspace(context.userId);
	const pay = await sql`
      select id, invoice_id, status from dcm_payments
      where id = ${data.paymentId} and user_id = ${context.userId} and tenant_id = ${tenantId}`;
	if (!pay[0]) throw new Error("ไม่พบรายการชำระ");
	if (String(pay[0].status) !== "PENDING") throw new Error("รายการนี้ดำเนินการแล้ว");
	if (data.reject) {
		await sql`
        update dcm_payments set status = 'REJECTED'
        where id = ${data.paymentId} and user_id = ${context.userId}`;
		return { ok: true };
	}
	const today = todayISO();
	await sql`
      update dcm_payments set status = 'CONFIRMED'
      where id = ${data.paymentId} and user_id = ${context.userId}`;
	await sql`
      update dcm_invoices set status = 'PAID'
      where id = ${String(pay[0].invoice_id)} and user_id = ${context.userId}`;
	const sub = await sql`
      select id, expiry_date from dcm_subscriptions
      where user_id = ${context.userId} and tenant_id = ${tenantId}
      order by created_at desc limit 1`;
	if (sub[0]) {
		sub[0].expiry_date >= today && sub[0].expiry_date;
		const start = sub[0].expiry_date >= today ? (() => {
			const d = /* @__PURE__ */ new Date(`${sub[0].expiry_date}T00:00:00Z`);
			d.setUTCDate(d.getUTCDate() + 1);
			return d.toISOString().slice(0, 10);
		})() : today;
		await sql`
        update dcm_subscriptions
        set start_date = ${start}, expiry_date = ${addMonthsMinusDay(start, 1)}, status = 'ACTIVE'
        where id = ${sub[0].id} and user_id = ${context.userId}`;
	}
	return { ok: true };
});
//#endregion
export { confirmPayment_createServerFn_handler, createTenant_createServerFn_handler, deleteCollection_createServerFn_handler, disableCustomer_createServerFn_handler, getBilling_createServerFn_handler, getDailyReport_createServerFn_handler, getDashboard_createServerFn_handler, getMonthlyReport_createServerFn_handler, listCollections_createServerFn_handler, listCustomers_createServerFn_handler, saveCollection_createServerFn_handler, saveCustomer_createServerFn_handler, submitPayment_createServerFn_handler, switchTenant_createServerFn_handler };
