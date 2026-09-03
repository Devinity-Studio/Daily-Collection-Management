import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { r as authMiddleware } from "./format-BifKjn1T.mjs";
import { i as useCurrentUserState, n as cn, r as useCurrentUser, t as Button } from "./button-yLxjv2W_.mjs";
import { a as hasGateSessionMarker } from "./server-Dajcr7tE.mjs";
import { c as Menu, d as CreditCard, f as ChartColumn, m as Building2, n as Wallet, o as Receipt, r as Users, t as X, u as LayoutDashboard } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-CSOl_GA8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-muted", className),
		...props
	});
}
var NAV = [
	{
		to: "/",
		label: "แดชบอร์ด",
		icon: LayoutDashboard
	},
	{
		to: "/customers",
		label: "ลูกค้า",
		icon: Users
	},
	{
		to: "/collections",
		label: "เก็บเงิน",
		icon: Wallet
	},
	{
		to: "/reports",
		label: "รายงาน",
		icon: ChartColumn
	},
	{
		to: "/subscription",
		label: "สมาชิก",
		icon: CreditCard
	},
	{
		to: "/tenants",
		label: "องค์กร",
		icon: Building2
	}
];
function Protected({ children, tenantName }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-svh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden w-64 bg-sidebar md:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-4 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg font-semibold",
					children: "เงินวัน"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "กำลังโหลดพื้นที่ทำงาน"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-48" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full" })
			]
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		tenantName,
		children
	});
}
function AppShell({ children, tenantName }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-svh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { tenantName }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex flex-1 flex-col gap-1 px-3 py-4",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-white/10 text-white" : "text-sidebar-muted hover:bg-white/6 hover:text-sidebar-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-sidebar-border p-3 text-sidebar-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => setOpen(true),
							"aria-label": "เมนู",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: "เงินวัน"
							}), tenantName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: tenantName
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					]
				}),
				open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "fixed inset-0 z-50 md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "absolute inset-0 bg-ink/40",
						"aria-label": "ปิดเมนู",
						onClick: () => setOpen(false)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pr-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { tenantName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "text-sidebar-foreground",
								onClick: () => setOpen(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex flex-1 flex-col gap-1 px-3 py-4",
							children: NAV.map((item) => {
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									onClick: () => setOpen(false),
									className: "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground hover:bg-white/8",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
								}, item.to);
							})
						})]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10",
					children
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur md:hidden",
					children: NAV.slice(0, 5).map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				})
			]
		})]
	});
}
function Brand({ tenantName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-5 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid size-10 place-items-center rounded-md bg-primary text-primary-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold tracking-tight text-sidebar-foreground",
				children: "เงินวัน"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-sidebar-muted",
				children: tenantName ?? "Daily Collection"
			})]
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b190a974d7f6603d23c58b6baaf37cd801cc93a640a919666fc88a30f50985b0"));
var switchTenant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("5a28f59c68c4f1397f972b9d6ca48377a4cf13c13f331998bb5bf8b1962c2dc9"));
var createTenant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("79eeab338e26c1a1a77d2c857ac64190672cc972d45e0e17bd79867a94fb8073"));
var listCustomers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2900ea46510e863556f7c4f8dd8403e7b01085c4a4dc8cd139400be5facd77d0"));
var saveCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("4b4a56a699c0badff4f610c5551d47bb092263f0a210d96f7c607c912987fc5c"));
var disableCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("893a5a3fdb809f9e55543b1e0010932d35d6ba98fdee3b756e5115053a708943"));
var listCollections = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d ?? {}).handler(createSsrRpc("606197a45c2a49d2a0ddf261aa0c003334b78158e8d7c7c4ca7ccc57c8a83c7f"));
var saveCollection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("588f8c8a7c53fda99f2e483e84ad8ba75b7d16a4b1814d3fa00e56c79379ed61"));
var deleteCollection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("078c3a39c9d2121e44f2c9565db3bb7b14d8cdb64284ad9d85286223cdc9c326"));
var getDailyReport = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("aace3ce042ff1a5007f7bcee8414e6d7434d660c4e3de92d0f13ecc003c7010e"));
var getMonthlyReport = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("29626d08bd505966edfde3b3a46282e3f4a19c1ffeb809275941032350fb05f0"));
var getBilling = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("941d46fdd165695d0a7cc7a815677c6352cb3622ac2e27c7ab5f93c144b56dc9"));
var submitPayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("a682f5433f0847fecd7d97a02990f24be75ee7be7ac52ca9a9bbb7acd33c9f6f"));
var confirmPayment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("1174b7d1e303857dc71b794a2b526a367e1954eef96a1e9d285a23c04846d1a1"));
//#endregion
export { deleteCollection as a, getDailyReport as c, listCollections as d, listCustomers as f, switchTenant as g, submitPayment as h, createTenant as i, getDashboard as l, saveCustomer as m, Skeleton as n, disableCustomer as o, saveCollection as p, confirmPayment as r, getBilling as s, Protected as t, getMonthlyReport as u };
