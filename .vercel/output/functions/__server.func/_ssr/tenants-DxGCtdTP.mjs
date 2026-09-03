import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatBaht } from "./format-BifKjn1T.mjs";
import { t as Button } from "./button-yLxjv2W_.mjs";
import { g as switchTenant, i as createTenant, l as getDashboard, t as Protected } from "./server-CSOl_GA8.mjs";
import { n as CardContent, t as Card } from "./card-DZFe1reO.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-4vanIucO.mjs";
import { n as Label, t as Input } from "./label-CHrNMqBG.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-BsVInEpr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenants-DxGCtdTP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TenantsPage() {
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const create = useMutation({
		mutationFn: createTenant,
		onSuccess: () => {
			toast.success("สร้างองค์กรแล้ว");
			setOpen(false);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const switchMut = useMutation({
		mutationFn: (tenantId) => switchTenant({ data: { tenantId } }),
		onSuccess: () => {
			toast.success("สลับองค์กรแล้ว");
			qc.invalidateQueries();
		}
	});
	const d = q.data;
	const mrr = (d?.tenants.length ?? 0) * 5e3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, {
		tenantName: d?.tenant.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "องค์กรในระบบ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "มุมมองผู้ให้บริการ — จัดการหลายบริษัทบนแพลตฟอร์มเดียวกัน"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOpen(true),
					children: "เพิ่มองค์กร"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "จำนวนองค์กร"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-3xl tabular-nums",
								children: d?.tenants.length ?? 0
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "รายได้รายเดือนโดยประมาณ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-3xl tabular-nums",
								children: formatBaht(mrr)
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "รอตรวจชำระ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-3xl tabular-nums",
								children: d?.pendingPayments ?? 0
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-hidden rounded-xl border border-border bg-card",
				children: (d?.tenants ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["รหัส ", t.code]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: t.id === d?.tenant.id ? "primary" : "neutral",
							children: t.id === d?.tenant.id ? "กำลังใช้" : t.status
						}), t.id !== d?.tenant.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => switchMut.mutate(t.id),
							children: "สลับไปองค์กรนี้"
						}) : null]
					})]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "เพิ่มองค์กร" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						create.mutate({ data: {
							name: String(fd.get("name") ?? ""),
							contactName: String(fd.get("contact") ?? ""),
							phone: String(fd.get("phone") ?? "")
						} });
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "name",
								children: "ชื่อบริษัท"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "name",
								name: "name",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "contact",
								children: "ผู้ติดต่อ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "contact",
								name: "contact"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "โทรศัพท์"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								name: "phone"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: create.isPending,
							children: "สร้างและเปิดใช้งาน"
						})
					]
				})] })
			})
		]
	});
}
//#endregion
export { TenantsPage as component };
