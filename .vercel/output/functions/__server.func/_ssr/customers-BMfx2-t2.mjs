import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatBaht } from "./format-BifKjn1T.mjs";
import { t as Button } from "./button-yLxjv2W_.mjs";
import { f as listCustomers, l as getDashboard, m as saveCustomer, o as disableCustomer, t as Protected } from "./server-CSOl_GA8.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-4vanIucO.mjs";
import { n as Label, t as Input } from "./label-CHrNMqBG.mjs";
import { t as Textarea } from "./textarea-yaKABPDo.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-BsVInEpr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-BMfx2-t2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const qc = useQueryClient();
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const q = useQuery({
		queryKey: ["customers"],
		queryFn: () => listCustomers()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: saveCustomer,
		onSuccess: () => {
			toast.success("บันทึกลูกค้าแล้ว");
			setOpen(false);
			setEditing(null);
			qc.invalidateQueries({ queryKey: ["customers"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const disable = useMutation({
		mutationFn: (id) => disableCustomer({ data: { id } }),
		onSuccess: () => {
			toast.success("ปิดการใช้งานลูกค้าแล้ว");
			qc.invalidateQueries({ queryKey: ["customers"] });
		}
	});
	const rows = (q.data ?? []).filter((c) => {
		const s = search.trim().toLowerCase();
		if (!s) return true;
		return [
			c.name,
			c.phone,
			c.customerCode
		].some((v) => (v ?? "").toLowerCase().includes(s));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, {
		tenantName: dash.data?.tenant.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "ลูกค้า"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "รายชื่อลูกค้าขององค์กรนี้"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					children: "เพิ่มลูกค้า"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-5 max-w-md",
				placeholder: "ค้นหาชื่อ เบอร์ หรือรหัส",
				value: search,
				onChange: (e) => setSearch(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 overflow-hidden rounded-xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden grid-cols-12 gap-3 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground sm:grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-4",
							children: "ลูกค้า"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-3",
							children: "ติดต่อ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2 text-right",
							children: "ยอดรวม"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-3 text-right",
							children: "จัดการ"
						})
					]
				}), q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-sm text-muted-foreground",
					children: "กำลังโหลด..."
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-sm text-muted-foreground",
					children: "ยังไม่มีลูกค้า"
				}) : rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-12 sm:items-center sm:gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: c.customerCode ?? "ไม่มีรหัส"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-muted-foreground sm:col-span-3",
							children: [c.phone ?? "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-xs",
								children: c.address
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-sm tabular-nums sm:col-span-2 sm:text-right",
							children: [formatBaht(c.totalAmount), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [c.totalCount, " รายการ"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 sm:col-span-3 sm:justify-end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: c.status === "ACTIVE" ? "success" : "neutral",
									children: c.status === "ACTIVE" ? "ใช้งาน" : "ปิด"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setEditing(c);
										setOpen(true);
									},
									children: "แก้ไข"
								}),
								c.status === "ACTIVE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => disable.mutate(c.id),
									children: "ปิดใช้"
								}) : null
							]
						})
					]
				}, c.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						save.mutate({ data: {
							id: editing?.id,
							name: String(fd.get("name") ?? ""),
							customerCode: String(fd.get("code") ?? ""),
							phone: String(fd.get("phone") ?? ""),
							address: String(fd.get("address") ?? "")
						} });
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "ชื่อลูกค้า",
							name: "name",
							defaultValue: editing?.name,
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "รหัส",
							name: "code",
							defaultValue: editing?.customerCode ?? ""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "โทรศัพท์",
							name: "phone",
							defaultValue: editing?.phone ?? ""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "address",
								children: "ที่อยู่"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "address",
								name: "address",
								defaultValue: editing?.address ?? ""
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: save.isPending,
							children: "บันทึก"
						})
					]
				})] })
			})
		]
	});
}
function Field({ label, name, defaultValue, required }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: name,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: name,
			name,
			defaultValue,
			required
		})]
	});
}
//#endregion
export { CustomersPage as component };
