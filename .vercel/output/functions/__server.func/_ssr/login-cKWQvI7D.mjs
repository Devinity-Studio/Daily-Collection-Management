import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-B40BzJxt.mjs";
import { i as useCurrentUserState, t as Button } from "./button-yLxjv2W_.mjs";
import { t as GROK_PROVIDERS } from "./server-Dajcr7tE.mjs";
import { o as Receipt } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-DZFe1reO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-cKWQvI7D.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-svh place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold",
			children: "เงินวัน"
		})
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-svh place-items-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "w-full max-w-md rounded-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6 p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-11 place-items-center rounded-md bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold",
							children: "เงินวัน"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "เข้าสู่ระบบเพื่อจัดการยอดเก็บเงิน"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							className: "w-full",
							onClick: () => signIn(p.providerId, { callbackURL: "/" }),
							children: ["เข้าสู่ระบบด้วย ", p.label]
						}, p.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "underline-offset-4 hover:underline",
							children: "กลับหน้าแรก"
						})
					})
				]
			})
		})
	});
}
//#endregion
export { Login as component };
