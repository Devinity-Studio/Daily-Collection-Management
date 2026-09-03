import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as formatDateLongTh, i as formatBaht, s as todayISO, t as METHOD_LABEL } from "./format-BifKjn1T.mjs";
import { n as cn } from "./button-yLxjv2W_.mjs";
import { c as getDailyReport, l as getDashboard, t as Protected, u as getMonthlyReport } from "./server-CSOl_GA8.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-DZFe1reO.mjs";
import { n as Label, t as Input } from "./label-CHrNMqBG.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-CyTAD9wX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-11 items-center rounded-lg bg-muted p-1 text-muted-foreground", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		className: cn("mt-4", className),
		...props
	});
}
function ReportsPage() {
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const today = todayISO();
	const [date, setDate] = (0, import_react.useState)(today);
	const now = /* @__PURE__ */ new Date();
	const [month, setMonth] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const daily = useQuery({
		queryKey: ["report-daily", date],
		queryFn: () => getDailyReport({ data: { date } })
	});
	const [y, m] = month.split("-").map(Number);
	const monthly = useQuery({
		queryKey: [
			"report-monthly",
			y,
			m
		],
		queryFn: () => getMonthlyReport({ data: {
			year: y,
			month: m
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, {
		tenantName: dash.data?.tenant.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "รายงาน"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "สรุปยอดรายวันและรายเดือน"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "daily",
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "daily",
						children: "รายวัน"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "monthly",
						children: "รายเดือน"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "daily",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 max-w-xs space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "วันที่" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: date,
								onChange: (e) => setDate(e.target.value)
							})]
						}), daily.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
									label: "รวมทั้งวัน",
									value: formatBaht(daily.data.totalAmount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
									label: "จำนวนรายการ",
									value: String(daily.data.totalCount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
									label: "วันที่",
									value: formatDateLongTh(daily.data.date)
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "mt-4 rounded-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "แยกช่องทาง" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "space-y-2",
								children: daily.data.byMethod.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "ไม่มีข้อมูล"
								}) : daily.data.byMethod.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: METHOD_LABEL[r.method] ?? r.method }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono tabular-nums",
										children: [
											formatBaht(r.amount),
											" · ",
											r.count,
											" รายการ"
										]
									})]
								}, r.method))
							})]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "กำลังโหลด..."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "monthly",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 max-w-xs space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "เดือน" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "month",
								value: month,
								onChange: (e) => setMonth(e.target.value)
							})]
						}), monthly.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
									label: "ยอดรวมเดือน",
									value: formatBaht(monthly.data.totalAmount)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
									label: "จำนวนรายการ",
									value: String(monthly.data.totalCount)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "mt-4 rounded-xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "แนวโน้มรายวัน" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "h-56",
									children: monthly.data.byDay.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "ไม่มีข้อมูล"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
										width: "100%",
										height: "100%",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
											data: monthly.data.byDay.map((d) => ({
												...d,
												day: d.date.slice(8)
											})),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
													dataKey: "day",
													tick: { fontSize: 11 },
													axisLine: false,
													tickLine: false
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { hide: true }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => formatBaht(v) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
													dataKey: "amount",
													fill: "var(--color-primary)",
													radius: [
														4,
														4,
														0,
														0
													]
												})
											]
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-4 lg:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "rounded-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "แยกช่องทาง" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
										className: "space-y-2",
										children: monthly.data.byMethod.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: METHOD_LABEL[r.method] ?? r.method }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono tabular-nums",
												children: formatBaht(r.amount)
											})]
										}, r.method))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "rounded-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "ลูกค้าที่ยอดสูง" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
										className: "space-y-2",
										children: monthly.data.topCustomers.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate pr-3",
												children: r.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono tabular-nums",
												children: formatBaht(r.amount)
											})]
										}, r.name))
									})]
								})]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "กำลังโหลด..."
						})]
					})
				]
			})
		]
	});
}
function Summary({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "rounded-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-2xl font-medium tabular-nums",
				children: value
			})]
		})
	});
}
//#endregion
export { ReportsPage as component };
