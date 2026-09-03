import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-BifKjn1T.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B40BzJxt.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-D6JwGPoG.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
function formatBaht(value) {
	const n = typeof value === "string" ? Number(value) : value ?? 0;
	return new Intl.NumberFormat("th-TH", {
		style: "currency",
		currency: "THB",
		maximumFractionDigits: 0
	}).format(Number.isFinite(n) ? n : 0);
}
function formatDateTh(isoDate) {
	if (!isoDate) return "—";
	const d = /* @__PURE__ */ new Date(`${isoDate}T00:00:00`);
	if (Number.isNaN(d.getTime())) return isoDate;
	return new Intl.DateTimeFormat("th-TH", {
		day: "numeric",
		month: "short",
		year: "numeric"
	}).format(d);
}
function formatDateLongTh(isoDate) {
	if (!isoDate) return "—";
	const d = /* @__PURE__ */ new Date(`${isoDate}T00:00:00`);
	if (Number.isNaN(d.getTime())) return isoDate;
	return new Intl.DateTimeFormat("th-TH", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(d);
}
function todayISO() {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
var METHOD_LABEL = {
	CASH: "เงินสด",
	BANK_TRANSFER: "โอนเงิน",
	QR_CODE: "QR Code",
	OTHER: "อื่น ๆ"
};
var STATUS_LABEL = {
	ACTIVE: "ใช้งาน",
	PENDING_PAYMENT: "รอชำระ",
	EXPIRED: "หมดอายุ",
	SUSPENDED: "ระงับ",
	PENDING: "รอยืนยัน",
	CONFIRMED: "ยืนยันแล้ว",
	PAID: "ชำระแล้ว",
	REJECTED: "ปฏิเสธ",
	DISABLED: "ปิดใช้งาน"
};
//#endregion
export { formatDateLongTh as a, formatBaht as i, STATUS_LABEL as n, formatDateTh as o, authMiddleware as r, todayISO as s, METHOD_LABEL as t };
