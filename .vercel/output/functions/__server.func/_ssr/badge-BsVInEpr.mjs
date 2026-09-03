import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./button-yLxjv2W_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-BsVInEpr.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tone === "neutral" && "bg-muted text-muted-foreground", tone === "success" && "bg-accent text-success", tone === "warn" && "bg-secondary text-warn", tone === "danger" && "bg-destructive/10 text-destructive", tone === "primary" && "bg-primary/10 text-primary", className),
		...props
	});
}
//#endregion
export { Badge as t };
