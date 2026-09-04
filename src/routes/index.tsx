import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Landmark,
  QrCode,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Protected } from "@/components/app-shell";
import { PaywallBanner } from "@/components/paywall";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { getAccountSummary, getDashboard, switchTenant } from "@/lib/dcm/server";
import { formatBaht, formatDateTh, METHOD_LABEL, STATUS_LABEL } from "@/lib/format";
import { Select } from "@/components/ui/select";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-ink">เงินวัน</p>
          <p className="mt-1 text-sm text-muted-foreground">กำลังเตรียมระบบเก็บเงิน</p>
        </div>
      </div>
    );
  }
  if (!user) return <Landing />;
  return <Dashboard />;
}

function Landing() {
  return (
    <main className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Receipt className="size-4" />
          </div>
          <span className="font-semibold">เงินวัน</span>
        </div>
        <Button asChild variant="outline">
          <Link to="/login">เข้าสู่ระบบ</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-16 pt-8">
        <p className="text-sm font-medium tracking-wide text-primary">Daily Collection Management</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
          เก็บเงินทุกวัน ให้ครบ ชัดเจน และพร้อมสรุปยอด
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          ระบบ SaaS สำหรับธุรกิจที่รับชำระจากลูกค้าจำนวนมาก บันทึกรายวัน ดูรายงาน
          และต่ออายุการใช้งานแบบรายเดือน
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {authEnabled
            ? GROK_PROVIDERS.slice(0, 2).map((p) => (
                <Button key={p.providerId} onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
                  เริ่มใช้งานด้วย {p.label}
                </Button>
              ))
            : (
              <Button asChild>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
            )}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Wallet, title: "บันทึกยอดรายวัน", body: "เงินสด โอน QR — รู้ยอดทันทีหลังเก็บ" },
            { icon: CalendarDays, title: "สรุปวันและเดือน", body: "แยกช่องทางชำระ และดูลูกค้าที่มียอดสูง" },
            { icon: ShieldCheck, title: "สมาชิกรายเดือน", body: "เปิด-ปิดสิทธิ์ตามรอบชำระ 5,000 บาท/เดือน" },
          ].map((f) => (
            <Card key={f.title} className="rounded-xl">
              <CardContent className="p-5">
                <f.icon className="mb-3 size-5 text-primary" />
                <p className="font-semibold">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const loanSummary = useQuery({ queryKey: ["account-summary"], queryFn: () => getAccountSummary() });
  const switchMut = useMutation({
    mutationFn: (tenantId: string) => switchTenant({ data: { tenantId } }),
    onSuccess: () => {
      void qc.invalidateQueries();
    },
  });

  if (q.isLoading) {
    return (
      <Protected>
        <Skeleton className="h-10 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </Protected>
    );
  }
  if (q.error || !q.data) {
    return (
      <Protected>
        <p className="text-sm text-destructive">ไม่สามารถโหลดข้อมูลได้ ลองรีเฟรชอีกครั้ง</p>
      </Protected>
    );
  }

  const d = q.data;
  const chart = d.todayByMethod.map((m) => ({
    name: METHOD_LABEL[m.method] ?? m.method,
    amount: m.amount,
  }));

  return (
    <Protected tenantName={d.tenant.name}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">ภาพรวมวันนี้</p>
          <h1 className="text-2xl font-semibold tracking-tight">{d.tenant.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {d.tenants.length > 1 ? (
            <Select
              value={d.tenant.id}
              onChange={(e) => switchMut.mutate(e.target.value)}
              className="max-w-56"
            >
              {d.tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          ) : null}
          <Button asChild>
            <Link to="/collections">
              บันทึกยอดเก็บ
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <PaywallBanner locked={d.locked} price={d.subscription.price} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="ยอดเก็บวันนี้"
          value={formatBaht(d.todayAmount)}
          hint={`${d.todayCount} รายการ`}
          icon={Banknote}
        />
        <Stat
          label="ยอดเดือนนี้"
          value={formatBaht(d.monthAmount)}
          hint={`${d.monthCount} รายการ`}
          icon={Wallet}
        />
        <Card className="rounded-xl">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">สถานะสมาชิก</p>
              <Badge tone={d.subscription.status === "ACTIVE" ? "success" : "warn"}>
                {STATUS_LABEL[d.subscription.status] ?? d.subscription.status}
              </Badge>
            </div>
            <p className="mt-3 font-mono text-3xl font-medium tabular-nums">
              {d.subscription.daysRemaining}
              <span className="ml-1 text-base font-normal text-muted-foreground">วัน</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              หมดอายุ {formatDateTh(d.subscription.expiryDate)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle>แยกช่องทางวันนี้</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {chart.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีรายการวันนี้</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => formatBaht(v)} />
                  <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>รายการล่าสุด</CardTitle>
            <Link to="/collections" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y divide-border">
              {d.recent.length === 0 ? (
                <li className="px-5 py-6 text-sm text-muted-foreground">ยังไม่มีรายการเก็บเงิน</li>
              ) : (
                d.recent.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTh(row.collectionDate)} · {METHOD_LABEL[row.paymentMethod]}
                        {row.collectorName ? ` · ${row.collectorName}` : ""}
                      </p>
                    </div>
                    <p className="font-mono text-sm tabular-nums">{formatBaht(row.amount)}</p>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {loanSummary.data && loanSummary.data.totalAccounts > 0 ? (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">สรุปเงินกู้</h2>
            <Link to="/accounts" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Landmark className="size-4 text-primary" />
                  <p className="text-sm text-muted-foreground">บัญชีทั้งหมด</p>
                </div>
                <p className="mt-2 font-mono text-2xl tabular-nums">
                  {loanSummary.data.totalAccounts}
                  <span className="ml-1 text-sm text-muted-foreground">บัญชี</span>
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">ค้างชำระรวม</p>
                <p className="mt-2 font-mono text-2xl tabular-nums text-destructive">
                  {formatBaht(loanSummary.data.totalOutstanding)}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">ชำระแล้วรวม</p>
                <p className="mt-2 font-mono text-2xl tabular-nums text-primary">
                  {formatBaht(loanSummary.data.totalPaid)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <QrCode className="size-4" /> รองรับเงินสด / โอน / QR
        </span>
        {d.pendingPayments > 0 ? (
          <Link to="/subscription" className="text-warn hover:underline">
            มี {d.pendingPayments} รายการรอตรวจชำระ
          </Link>
        ) : null}
      </div>
    </Protected>
  );
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" />
        </div>
        <p className="mt-3 font-mono text-3xl font-medium tabular-nums tracking-tight">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
