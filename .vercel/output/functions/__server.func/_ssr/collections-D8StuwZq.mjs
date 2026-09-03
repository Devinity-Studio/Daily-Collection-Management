import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatBaht, o as formatDateTh, s as todayISO, t as METHOD_LABEL } from "./format-BifKjn1T.mjs";
import { t as Button } from "./button-yLxjv2W_.mjs";
import { a as deleteCollection, d as listCollections, f as listCustomers, l as getDashboard, p as saveCollection, t as Protected } from "./server-CSOl_GA8.mjs";
import { t as PaywallBanner } from "./paywall-BZlKaX5o.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-4vanIucO.mjs";
import { n as Label, t as Input } from "./label-CHrNMqBG.mjs";
import { t as Select } from "./select-RJZhdAsR.mjs";
import { t as Textarea } from "./textarea-yaKABPDo.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collections-D8StuwZq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CollectionsPage() {
	const qc = useQueryClient();
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const customers = useQuery({
		queryKey: ["customers"],
		queryFn: () => listCustomers()
	});
	const [dateFrom, setDateFrom] = (0, import_react.useState)(todayISO());
	const [dateTo, setDateTo] = (0, import_react.useState)(todayISO());
	const [customerId, setCustomerId] = (0, import_react.useState)("");
	const q = useQuery({
		queryKey: [
			"collections",
			dateFrom,
			dateTo,
			customerId
		],
		queryFn: () => listCollections({ data: {
			dateFrom,
			dateTo,
			customerId: customerId || void 0
		} })
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const save = useMutation({
		mutationFn: saveCollection,
		onSuccess: () => {
			toast.success("บันทึกยอดเก็บแล้ว");
			setOpen(false);
			setEditing(null);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: (id) => deleteCollection({ data: { id } }),
		onSuccess: () => {
			toast.success("ลบรายการแล้ว");
			qc.invalidateQueries();
		}
	});
	const total = (0, import_react.useMemo)(() => (q.data ?? []).reduce((s, r) => s + r.amount, 0), [q.data]);
	const locked = dash.data?.locked ?? false;
	const activeCustomers = (customers.data ?? []).filter((c) => c.status === "ACTIVE");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, {
		tenantName: dash.data?.tenant.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "เก็บเงินรายวัน"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: ["รวมตามตัวกรอง ", formatBaht(total)]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: locked,
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					children: "เพิ่มรายการ"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaywallBanner, {
				locked,
				price: dash.data?.subscription.price
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "จากวันที่" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: dateFrom,
							onChange: (e) => setDateFrom(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ถึงวันที่" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: dateTo,
							onChange: (e) => setDateTo(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ลูกค้า" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: customerId,
							onChange: (e) => setCustomerId(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "ทั้งหมด"
							}), (customers.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.name
							}, c.id))]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-hidden rounded-xl border border-border bg-card",
				children: q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-sm text-muted-foreground",
					children: "กำลังโหลด..."
				}) : (q.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-sm text-muted-foreground",
					children: "ไม่พบรายการในช่วงนี้"
				}) : (q.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: row.customerName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									formatDateTh(row.collectionDate),
									" · ",
									METHOD_LABEL[row.paymentMethod],
									row.collectorName ? ` · ${row.collectorName}` : ""
								]
							}),
							row.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: row.note
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums",
								children: formatBaht(row.amount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: locked,
								onClick: () => {
									setEditing(row);
									setOpen(true);
								},
								children: "แก้ไข"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								disabled: locked,
								onClick: () => {
									if (confirm("ลบรายการนี้?")) remove.mutate(row.id);
								},
								children: "ลบ"
							})
						]
					})]
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "แก้ไขรายการ" : "บันทึกยอดเก็บ" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						save.mutate({ data: {
							id: editing?.id,
							customerId: String(fd.get("customerId") ?? ""),
							collectionDate: String(fd.get("collectionDate") ?? todayISO()),
							amount: Number(fd.get("amount")),
							paymentMethod: String(fd.get("paymentMethod") ?? "CASH"),
							collectorName: String(fd.get("collectorName") ?? ""),
							note: String(fd.get("note") ?? "")
						} });
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "customerId",
								children: "ลูกค้า"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								id: "customerId",
								name: "customerId",
								defaultValue: editing?.customerId ?? activeCustomers[0]?.id ?? "",
								required: true,
								children: activeCustomers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "collectionDate",
									children: "วันที่"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "collectionDate",
									name: "collectionDate",
									type: "date",
									defaultValue: editing?.collectionDate ?? todayISO(),
									required: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "amount",
									children: "จำนวนเงิน"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "amount",
									name: "amount",
									type: "number",
									min: 1,
									step: "0.01",
									defaultValue: editing?.amount ?? "",
									required: true
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "paymentMethod",
									children: "วิธีชำระ"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "paymentMethod",
									name: "paymentMethod",
									defaultValue: editing?.paymentMethod ?? "CASH",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "CASH",
											children: "เงินสด"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "BANK_TRANSFER",
											children: "โอนเงิน"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "QR_CODE",
											children: "QR Code"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "OTHER",
											children: "อื่น ๆ"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "collectorName",
									children: "ผู้เก็บ"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "collectorName",
									name: "collectorName",
									defaultValue: editing?.collectorName ?? ""
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "note",
								children: "หมายเหตุ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "note",
								name: "note",
								defaultValue: editing?.note ?? ""
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
//#endregion
export { CollectionsPage as component };
