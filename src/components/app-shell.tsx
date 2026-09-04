import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CreditCard,
  Clock,
  Landmark,
  LayoutDashboard,
  Menu,
  Receipt,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";

const NAV = [
  { to: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
  { to: "/customers", label: "ลูกค้า", icon: Users },
  { to: "/collections", label: "เก็บเงิน", icon: Wallet },
  { to: "/accounts", label: "เงินกู้", icon: Landmark },
  { to: "/reports", label: "รายงาน", icon: BarChart3 },
  { to: "/subscription", label: "สมาชิก", icon: CreditCard },
  { to: "/tenants", label: "องค์กร", icon: Building2 },
  { to: "/audit", label: "ประวัติ", icon: Clock },
] as const;

export function Protected({
  children,
  tenantName,
}: {
  children: ReactNode;
  tenantName?: string;
}) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="flex min-h-svh bg-background">
        <div className="hidden w-64 bg-sidebar md:block" />
        <div className="flex-1 space-y-4 p-6">
          <p className="text-lg font-semibold">เงินวัน</p>
          <p className="text-sm text-muted-foreground">กำลังโหลดพื้นที่ทำงาน</p>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <AppShell tenantName={tenantName}>{children}</AppShell>;
}

function AppShell({ children, tenantName }: { children: ReactNode; tenantName?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Brand tenantName={tenantName} />
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-sidebar-muted hover:bg-white/6 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-sidebar-foreground">
          <UserButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="เมนู">
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">เงินวัน</p>
            {tenantName ? (
              <p className="truncate text-xs text-muted-foreground">{tenantName}</p>
            ) : null}
          </div>
          <UserButton />
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-ink/40"
              aria-label="ปิดเมนู"
              onClick={() => setOpen(false)}
            />
            <div className="relative flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground">
              <div className="flex items-center justify-between pr-2">
                <Brand tenantName={tenantName} />
                <Button variant="ghost" size="icon" className="text-sidebar-foreground" onClick={() => setOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground hover:bg-white/8"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur md:hidden">
          {NAV.slice(0, 5).map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function Brand({ tenantName }: { tenantName?: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
        <Receipt className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">เงินวัน</p>
        <p className="truncate text-xs text-sidebar-muted">{tenantName ?? "Daily Collection"}</p>
      </div>
    </div>
  );
}
