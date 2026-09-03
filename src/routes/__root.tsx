import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppQueryProvider } from "@/lib/query-client";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "เงินวัน";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#145C4C" },
      {
        name: "description",
        content: "ระบบบริหารการเก็บเงินรายวัน สำหรับธุรกิจที่รับชำระจากลูกค้าจำนวนมาก",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="th" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <AppQueryProvider>
            <Outlet />
            <Toaster position="top-center" richColors />
          </AppQueryProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
