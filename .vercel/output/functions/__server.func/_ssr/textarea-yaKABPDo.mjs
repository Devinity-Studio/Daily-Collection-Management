import "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./button-yLxjv2W_.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground", className),
		...props
	});
}
//#endregion
export { Textarea as t };
