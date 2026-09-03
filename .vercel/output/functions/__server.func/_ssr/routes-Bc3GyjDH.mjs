import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-B40BzJxt.mjs";
import { i as formatBaht, n as STATUS_LABEL, o as formatDateTh, t as METHOD_LABEL } from "./format-BifKjn1T.mjs";
import { i as useCurrentUserState, t as Button } from "./button-yLxjv2W_.mjs";
import { t as GROK_PROVIDERS } from "./server-Dajcr7tE.mjs";
import { a as ShieldCheck, g as ArrowRight, h as Banknote, n as Wallet, o as Receipt, p as CalendarDays, s as QrCode } from "../_libs/lucide-react.mjs";
import { g as switchTenant, l as getDashboard, n as Skeleton, t as Protected } from "./server-CSOl_GA8.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-DZFe1reO.mjs";
import { t as PaywallBanner } from "./paywall-BZlKaX5o.mjs";
import { t as Select } from "./select-RJZhdAsR.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-BsVInEpr.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bc3GyjDH.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-svh place-items-center bg-background px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold text-ink",
			children: "เงินวัน"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "กำลังเตรียมระบบเก็บเงิน"
		})] })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-svh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex max-w-5xl items-center justify-between px-5 py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-9 place-items-center rounded-md bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "เงินวัน"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					children: "เข้าสู่ระบบ"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-5xl px-5 pb-16 pt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium tracking-wide text-primary",
					children: "Daily Collection Management"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl",
					children: "เก็บเงินทุกวัน ให้ครบ ชัดเจน และพร้อมสรุปยอด"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-base leading-relaxed text-muted-foreground",
					children: "ระบบ SaaS สำหรับธุรกิจที่รับชำระจากลูกค้าจำนวนมาก บันทึกรายวัน ดูรายงาน และต่ออายุการใช้งานแบบรายเดือน"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex flex-col gap-3 sm:flex-row",
					children: GROK_PROVIDERS.slice(0, 2).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						children: ["เริ่มใช้งานด้วย ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-14 grid gap-4 sm:grid-cols-3",
					children: [
						{
							icon: Wallet,
							title: "บันทึกยอดรายวัน",
							body: "เงินสด โอน QR — รู้ยอดทันทีหลังเก็บ"
						},
						{
							icon: CalendarDays,
							title: "สรุปวันและเดือน",
							body: "แยกช่องทางชำระ และดูลูกค้าที่มียอดสูง"
						},
						{
							icon: ShieldCheck,
							title: "สมาชิกรายเดือน",
							body: "เปิด-ปิดสิทธิ์ตามรอบชำระ 5,000 บาท/เดือน"
						}
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "mb-3 size-5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: f.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm leading-relaxed text-muted-foreground",
									children: f.body
								})
							]
						})
					}, f.title))
				})
			]
		})]
	});
}
function Dashboard() {
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const switchMut = useMutation({
		mutationFn: (tenantId) => switchTenant({ data: { tenantId } }),
		onSuccess: () => {
			qc.invalidateQueries();
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 grid gap-4 sm:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" })
		]
	})] });
	if (q.error || !q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Protected, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-destructive",
		children: "ไม่สามารถโหลดข้อมูลได้ ลองรีเฟรชอีกครั้ง"
	}) });
	const d = q.data;
	const chart = d.todayByMethod.map((m) => ({
		name: METHOD_LABEL[m.method] ?? m.method,
		amount: m.amount
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Protected, {
		tenantName: d.tenant.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "ภาพรวมวันนี้"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: d.tenant.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [d.tenants.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: d.tenant.id,
						onChange: (e) => switchMut.mutate(e.target.value),
						className: "max-w-56",
						children: d.tenants.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: t.id,
							children: t.name
						}, t.id))
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/collections",
							children: ["บันทึกยอดเก็บ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaywallBanner, {
				locked: d.locked,
				price: d.subscription.price
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "ยอดเก็บวันนี้",
						value: formatBaht(d.todayAmount),
						hint: `${d.todayCount} รายการ`,
						icon: Banknote
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "ยอดเดือนนี้",
						value: formatBaht(d.monthAmount),
						hint: `${d.monthCount} รายการ`,
						icon: Wallet
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex h-full flex-col justify-between p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "สถานะสมาชิก"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: d.subscription.status === "ACTIVE" ? "success" : "warn",
										children: STATUS_LABEL[d.subscription.status] ?? d.subscription.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 font-mono text-3xl font-medium tabular-nums",
									children: [d.subscription.daysRemaining, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 text-base font-normal text-muted-foreground",
										children: "วัน"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: ["หมดอายุ ", formatDateTh(d.subscription.expiryDate)]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-xl lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "แยกช่องทางวันนี้" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-56",
						children: chart.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "ยังไม่มีรายการวันนี้"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: chart,
								barSize: 28,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										tick: { fontSize: 12 },
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { hide: true }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => formatBaht(v) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "amount",
										fill: "var(--color-primary)",
										radius: [
											6,
											6,
											0,
											0
										]
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-xl lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex-row items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "รายการล่าสุด" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/collections",
							className: "text-sm text-primary hover:underline",
							children: "ดูทั้งหมด"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "px-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: d.recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "px-5 py-6 text-sm text-muted-foreground",
								children: "ยังไม่มีรายการเก็บเงิน"
							}) : d.recent.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 px-5 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-medium",
										children: row.customerName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											formatDateTh(row.collectionDate),
											" · ",
											METHOD_LABEL[row.paymentMethod],
											row.collectorName ? ` · ${row.collectorName}` : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm tabular-nums",
									children: formatBaht(row.amount)
								})]
							}, row.id))
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4" }), " รองรับเงินสด / โอน / QR"]
				}), d.pendingPayments > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/subscription",
					className: "text-warn hover:underline",
					children: [
						"มี ",
						d.pendingPayments,
						" รายการรอตรวจชำระ"
					]
				}) : null]
			})
		]
	});
}
function Stat({ label, value, hint, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "rounded-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-mono text-3xl font-medium tabular-nums tracking-tight",
					children: value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: hint
				})
			]
		})
	});
}
//#endregion
export { Home as component };
