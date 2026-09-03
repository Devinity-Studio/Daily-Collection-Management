import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as formatBaht, n as STATUS_LABEL, o as formatDateTh, t as METHOD_LABEL } from "./format-BifKjn1T.mjs";
import { t as Button } from "./button-yLxjv2W_.mjs";
import { h as submitPayment, l as getDashboard, r as confirmPayment, s as getBilling, t as Protected } from "./server-CSOl_GA8.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-DZFe1reO.mjs";
import { n as Label, t as Input } from "./label-CHrNMqBG.mjs";
import { t as Select } from "./select-RJZhdAsR.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-BsVInEpr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscription-Bf7EV9vF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BillingPage() {
	const qc = useQueryClient();
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const q = useQuery({
		queryKey: ["billing"],
		queryFn: () => getBilling()
	});
	const [method, setMethod] = (0, import_react.useState)("QR_CODE");
	const [ref, setRef] = (0, import_react.useState)("");
	const submit = useMutation({
		mutationFn: () => submitPayment({ data: {
			paymentMethod: method,
			paymentReference: ref
		} }),
		onSuccess: () => {
			toast.success("แจ้งชำระเงินแล้ว รอการยืนยัน");
			setRef("");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const confirm = useMutation({
		mutationFn: (payload) => confirmPayment({ data: payload }),
		onSuccess: () => {
			toast.success("อัปเดตรายการชำระแล้ว");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const sub = q.data?.subscription;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, {
		tenantName: dash.data?.tenant.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "สมาชิกและการชำระเงิน"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "แพ็กเกจรายเดือน 5,000 บาท — ยืนยันการโอนด้วยตนเองในรุ่นทดลองนี้"
			}),
			sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex-row items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "แพ็กเกจปัจจุบัน" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: sub.status === "ACTIVE" ? "success" : "warn",
							children: STATUS_LABEL[sub.status] ?? sub.status
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "แผน",
								v: sub.planName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "ค่าบริการ",
								v: `${formatBaht(sub.price)} / เดือน`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "เริ่มต้น",
								v: formatDateTh(sub.startDate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "หมดอายุ",
								v: formatDateTh(sub.expiryDate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "เหลือ",
								v: `${sub.daysRemaining} วัน`
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "ชำระค่าบริการรอบถัดไป" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-muted p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "โอนเข้าบัญชี"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-mono text-sm",
										children: "ธนาคารกสิกรไทย 123-4-56789-0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted-foreground",
										children: ["บจก. เงินวัน · ", formatBaht(sub.price)]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrBlock, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "space-y-3",
								onSubmit: (e) => {
									e.preventDefault();
									submit.mutate();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ช่องทาง" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: method,
											onChange: (e) => setMethod(e.target.value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "QR_CODE",
												children: "QR Code"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "BANK_TRANSFER",
												children: "โอนเงิน"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "เลขที่อ้างอิง / เวลาโอน" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: ref,
											onChange: (e) => setRef(e.target.value),
											required: true,
											placeholder: "เช่น 14:32 / 123456"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full",
										disabled: submit.isPending,
										children: "แจ้งชำระเงิน"
									})
								]
							})
						]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: "กำลังโหลด..."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6 rounded-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "รายการชำระ" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-3",
					children: (q.data?.payments ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "ยังไม่มีรายการ"
					}) : q.data.payments.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: formatBaht(p.amount)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								METHOD_LABEL[p.paymentMethod ?? ""] ?? p.paymentMethod,
								" · ",
								p.paymentReference
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: p.status === "CONFIRMED" ? "success" : p.status === "PENDING" ? "warn" : "danger",
								children: STATUS_LABEL[p.status] ?? p.status
							}), p.status === "PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => confirm.mutate({ paymentId: p.id }),
								children: "ยืนยัน"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => confirm.mutate({
									paymentId: p.id,
									reject: true
								}),
								children: "ปฏิเสธ"
							})] }) : null]
						})]
					}, p.id))
				})]
			})
		]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: v
		})]
	});
}
function QrBlock() {
	const cells = Array.from({ length: 121 }, (_, i) => {
		const x = i % 11;
		const y = Math.floor(i / 11);
		return x < 3 && y < 3 || x > 7 && y < 3 || x < 3 && y > 7 || (x * 7 + y * 13 + 5) % 3 === 0;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid size-28 grid-cols-11 gap-px rounded-md bg-card p-2 ring-1 ring-border",
			children: cells.map((on, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: on ? "bg-ink" : "bg-transparent" }, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-relaxed text-muted-foreground",
			children: "สแกน QR (จำลอง) หรือโอนตามบัญชีด้านบน แล้วกรอกเลขอ้างอิง"
		})]
	});
}
//#endregion
export { BillingPage as component };
