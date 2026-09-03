import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as formatBaht } from "./format-BifKjn1T.mjs";
import { t as Button } from "./button-yLxjv2W_.mjs";
import { l as Lock } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-DZFe1reO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/paywall-BZlKaX5o.js
var import_jsx_runtime = require_jsx_runtime();
function PaywallBanner({ locked, price = 5e3 }) {
	if (!locked) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "mb-6 border-warn/30 bg-secondary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mt-0.5 size-5 text-warn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "สิทธิ์การใช้งานหมดอายุ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"ชำระค่าบริการ ",
						formatBaht(price),
						" เพื่อเปิดระบบเก็บเงินต่อ"
					]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/subscription",
					children: "ไปหน้าชำระเงิน"
				})
			})]
		})
	});
}
//#endregion
export { PaywallBanner as t };
