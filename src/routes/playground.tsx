import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getPlaygroundDashboard,
  listPlaygroundCustomers,
  createPlaygroundCustomer,
  listPlaygroundAccounts,
  createPlaygroundAccount,
  getPlaygroundInstallments,
  recordPlaygroundPayment,
  listPlaygroundTasks,
  updatePlaygroundTask,
  createPlaygroundTask,
  reportPlaygroundProblem,
  listPlaygroundProblems,
  resolvePlaygroundProblem,
  createPlaygroundTakeover,
  getPlaygroundStaff,
  getPlaygroundDrillDown,
  resetPlaygroundData,
  getPlaygroundFinancialEvents,
  type PlaygroundDashboard,
} from "@/lib/dcm/playground-server";
import { formatBaht, formatDateTh, todayISO } from "@/lib/format";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Plus,
  RefreshCw,
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  UserCheck,
  FileText,
  Eye,
  RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/playground")({ component: PlaygroundPage });

const PROBLEM_TYPES = [
  { value: "CUSTOMER_NOT_FOUND", label: "ไม่พบลูกค้า" },
  { value: "CUSTOMER_REFUSED", label: "ลูกค้าปฏิเสธชำระ" },
  { value: "AMOUNT_DISPUTE", label: "โต้แย้งจำนวนเงิน" },
  { value: "PAYMENT_DELAY", label: "ขอเลื่อนชำระ" },
  { value: "ADDRESS_CHANGE", label: "ที่อยู่เปลี่ยน" },
  { value: "OTHER", label: "อื่น ๆ" },
];

const TASK_STATUS_LABELS: Record<string, { label: string; tone: "success" | "warn" | "danger" | "neutral" }> = {
  PENDING: { label: "รอดำเนินการ", tone: "warn" },
  IN_PROGRESS: { label: "กำลังเก็บ", tone: "neutral" },
  PAID: { label: "เก็บแล้ว", tone: "success" },
  PROBLEM: { label: "มีปัญหา", tone: "danger" },
  TAKE_OVER: { label: "รอรับมอบ", tone: "warn" },
};

function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "customers" | "accounts" | "tasks" | "problems" | "drilldown" | "ledger">("dashboard");
  const [showScenarios, setShowScenarios] = useState(true);

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Receipt className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">DCM Playground</p>
              <p className="text-xs text-muted-foreground">พื้นที่ทดลองระบบ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" className="text-xs">Demo Mode</Badge>
          </div>
        </div>
      </header>

      {showScenarios && (
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">สถานีการทดลอง</h2>
                <p className="text-sm text-muted-foreground">เลือกสถานการณ์ที่ต้องการทดลอง</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowScenarios(false)}>
                ซ่อน
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Users, title: "สร้างลูกค้าใหม่", desc: "ลองเพิ่มข้อมูลลูกค้า", tab: "customers" as const },
                { icon: FileText, title: "สร้างสัญญา", desc: "ลองเปิดบัญชีเงินกู้", tab: "accounts" as const },
                { icon: CheckCircle, title: "บันทึกยอดเก็บ", desc: "ทดลองรับชำระเงิน", tab: "tasks" as const },
                { icon: AlertTriangle, title: "รายงานปัญหา", desc: "บันทึกปัญหาที่พบ", tab: "problems" as const },
              ].map((s) => (
                <button
                  key={s.tab}
                  onClick={() => { setActiveTab(s.tab); setShowScenarios(false); }}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <s.icon className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {[
            { id: "dashboard", label: "แดชบอร์ด", icon: TrendingUp },
            { id: "customers", label: "ลูกค้า", icon: Users },
            { id: "accounts", label: "สัญญา", icon: FileText },
            { id: "tasks", label: "งานวันนี้", icon: CheckCircle },
            { id: "problems", label: "ปัญหา", icon: AlertTriangle },
            { id: "drilldown", label: "Drill Down", icon: Eye },
            { id: "ledger", label: "บันทึกรายการ", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === "dashboard" && <PlaygroundDashboard onNavigate={setActiveTab} />}
        {activeTab === "customers" && <PlaygroundCustomers />}
        {activeTab === "accounts" && <PlaygroundAccounts />}
        {activeTab === "tasks" && <PlaygroundTasks />}
        {activeTab === "problems" && <PlaygroundProblems />}
        {activeTab === "drilldown" && <PlaygroundDrillDown />}
        {activeTab === "ledger" && <PlaygroundLedger />}
      </main>
    </div>
  );
}

function PlaygroundDashboard({ onNavigate }: { onNavigate: (tab: "dashboard" | "customers" | "accounts" | "tasks" | "problems" | "drilldown" | "ledger") => void }) {
  const q = useQuery({ queryKey: ["playground-dashboard"], queryFn: () => getPlaygroundDashboard() });
  const reset = useMutation({
    mutationFn: () => resetPlaygroundData(),
    onSuccess: () => {
      toast.success("รีเซ็ตข้อมูลเรียบร้อยแล้ว");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  if (q.error || !q.data) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="mt-1 text-sm text-muted-foreground">{q.error?.message}</p>
          <Button className="mt-3" onClick={() => void q.refetch()}>ลองใหม่</Button>
        </div>
      </div>
    );
  }

  const d = q.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ภาพรวม Playground</h1>
          <p className="text-sm text-muted-foreground">ทดลองใช้งานระบบ DCM แบบไม่มีข้อจำกัด</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => reset.mutate()}
          disabled={reset.isPending}
        >
          <RotateCcw className="mr-1 size-4" />
          Reset ข้อมูล
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="ลูกค้าทั้งหมด"
          value={String(d.stats.totalCustomers)}
          icon={Users}
          onClick={() => onNavigate("customers")}
        />
        <StatCard
          label="บัญชีเงินกู้"
          value={String(d.stats.activeAccounts)}
          icon={FileText}
          onClick={() => onNavigate("accounts")}
        />
        <StatCard
          label="ยอดค้างชำระ"
          value={formatBaht(d.stats.totalOutstanding)}
          icon={Wallet}
          tone="danger"
        />
        <StatCard
          label="งานรอดำเนินการ"
          value={String(d.stats.pendingTasks)}
          icon={Clock}
          onClick={() => onNavigate("tasks")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">ยอดเก็บวันนี้</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("tasks")}>
              ดูงานวันนี้ <ArrowRight className="ml-1 size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-semibold">{formatBaht(d.stats.todayAmount)}</p>
            <p className="text-sm text-muted-foreground">{d.stats.todayCollections} รายการ</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">ปัญหาที่รายงาน</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("problems")}>
              ดูทั้งหมด <ArrowRight className="ml-1 size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-semibold text-destructive">{d.stats.problemsCount}</p>
            <p className="text-sm text-muted-foreground">รายการ</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">รายการล่าสุด</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {d.recentCollections.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">ยังไม่มีรายการ</p>
          ) : (
            <ul className="divide-y divide-border">
              {d.recentCollections.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium">{c.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTh(c.collectionDate)} · {c.paymentMethod} · {c.collectorName}
                    </p>
                  </div>
                  <p className="font-mono text-sm">{formatBaht(c.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">ทีมเก็บเงิน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {d.staff.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <UserCheck className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone?: "danger";
  onClick?: () => void;
}) {
  return (
    <Card className={`rounded-xl ${onClick ? "cursor-pointer transition-colors hover:bg-muted/50" : ""}`} onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className={`size-4 ${tone === "danger" ? "text-destructive" : "text-primary"}`} />
        </div>
        <p className={`mt-2 font-mono text-2xl font-semibold ${tone === "danger" ? "text-destructive" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function PlaygroundCustomers() {
  const q = useQuery({ queryKey: ["playground-customers"], queryFn: () => listPlaygroundCustomers() });
  const create = useMutation({
    mutationFn: createPlaygroundCustomer,
    onSuccess: () => {
      toast.success("สร้างลูกค้าใหม่แล้ว");
      setOpen(false);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);

  if (q.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">เกิดข้อผิดพลาด</p>
        <p className="mt-1 text-sm text-muted-foreground">{q.error.message}</p>
        <Button className="mt-3" onClick={() => void q.refetch()}>ลองใหม่</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ลูกค้า</h1>
          <p className="text-sm text-muted-foreground">จัดการข้อมูลลูกค้าใน Playground</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 size-4" /> เพิ่มลูกค้า
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {(q.data ?? []).length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ยังไม่มีลูกค้า</p>
          </div>
        ) : (
          (q.data ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.customerCode} · {c.phone} · {c.address}
                </p>
              </div>
              <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                data: {
                  name: String(fd.get("name") ?? ""),
                  phone: String(fd.get("phone") ?? "") || undefined,
                  address: String(fd.get("address") ?? "") || undefined,
                  customerCode: String(fd.get("customerCode") ?? "") || undefined,
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อลูกค้า *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerCode">รหัสลูกค้า</Label>
                <Input id="customerCode" name="customerCode" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">โทรศัพท์</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">ที่อยู่</Label>
              <Textarea id="address" name="address" />
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              สร้างลูกค้า
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaygroundAccounts() {
  const q = useQuery({ queryKey: ["playground-accounts"], queryFn: () => listPlaygroundAccounts() });
  const customers = useQuery({ queryKey: ["playground-customers"], queryFn: () => listPlaygroundCustomers() });
  const create = useMutation({
    mutationFn: createPlaygroundAccount,
    onSuccess: () => {
      toast.success("สร้างบัญชีเงินกู้ใหม่แล้ว");
      setOpen(false);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (q.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">เกิดข้อผิดพลาด</p>
        <p className="mt-1 text-sm text-muted-foreground">{q.error.message}</p>
        <Button className="mt-3" onClick={() => void q.refetch()}>ลองใหม่</Button>
      </div>
    );
  }

  const selectedAccount = (q.data ?? []).find((a) => a.id === selectedId);

  if (selectedAccount) {
    return <AccountDetail account={selectedAccount} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">สัญญาเงินกู้</h1>
          <p className="text-sm text-muted-foreground">จัดการบัญชีเงินกู้และตารางผ่อนชำระ</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 size-4" /> เปิดบัญชีใหม่
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {(q.data ?? []).length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ยังไม่มีบัญชีเงินกู้</p>
          </div>
        ) : (
          (q.data ?? []).map((a) => (
            <button
              key={a.id}
              className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/50"
              onClick={() => setSelectedId(a.id)}
            >
              <div>
                <p className="font-medium">{a.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {a.accountNumber} · {a.termMonths} เดือน · {formatBaht(a.originalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">{formatBaht(a.outstandingBalance)}</p>
                <p className="text-xs text-muted-foreground">ค้างชำระ</p>
              </div>
            </button>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปิดบัญชีเงินกู้ใหม่</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                data: {
                  customerId: String(fd.get("customerId") ?? ""),
                  originalAmount: Number(fd.get("originalAmount")),
                  termMonths: Number(fd.get("termMonths")),
                  interestRate: Number(fd.get("interestRate") || 0),
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="customerId">ลูกค้า</Label>
              <Select id="customerId" name="customerId" required>
                {(customers.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="originalAmount">เงินต้น (บาท)</Label>
                <Input id="originalAmount" name="originalAmount" type="number" min={1} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="termMonths">ระยะเวลา (เดือน)</Label>
                <Input id="termMonths" name="termMonths" type="number" min={1} defaultValue={12} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interestRate">ดอกเบี้ย (%/ปี)</Label>
              <Input id="interestRate" name="interestRate" type="number" min={0} step="0.1" defaultValue={0} />
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              สร้างบัญชี
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountDetail({ account: acc, onBack }: { account: { id: string; customerName: string; accountNumber: string; originalAmount: number; outstandingBalance: number; totalPaid: number; status: string; termMonths: number }; onBack: () => void }) {
  const installments = useQuery({
    queryKey: ["playground-installments", acc.id],
    queryFn: () => getPlaygroundInstallments({ data: { accountId: acc.id } }),
  });
  const pay = useMutation({
    mutationFn: recordPlaygroundPayment,
    onSuccess: () => {
      toast.success("บันทึกการชำระแล้ว");
      setPayOpen(false);
      void installments.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const [payOpen, setPayOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<{ id: string; installmentNumber: number; totalAmount: number; amountPaid: number } | null>(null);

  if (installments.isLoading) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> กลับ
        </button>
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  if (installments.error) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> กลับ
        </button>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">เกิดข้อผิดพลาด</p>
          <p className="mt-1 text-sm text-muted-foreground">{installments.error.message}</p>
          <Button className="mt-3" onClick={() => void installments.refetch()}>ลองใหม่</Button>
        </div>
      </div>
    );
  }

  const paidCount = (installments.data ?? []).filter((i) => i.status === "PAID").length;
  const totalCount = installments.data?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> กลับ
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{acc.customerName}</h1>
          <p className="text-sm text-muted-foreground">{acc.accountNumber}</p>
        </div>
        <Badge tone={acc.status === "ACTIVE" ? "success" : "primary"}>{acc.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">เงินต้น</p>
            <p className="mt-1 font-mono text-lg">{formatBaht(acc.originalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ชำระแล้ว</p>
            <p className="mt-1 font-mono text-lg text-primary">{formatBaht(acc.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ค้างชำระ</p>
            <p className="mt-1 font-mono text-lg text-destructive">{formatBaht(acc.outstandingBalance)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ความคืบหน้า</p>
            <p className="mt-1 font-mono text-lg">{paidCount}/{totalCount} ({progress}%)</p>
          </CardContent>
        </Card>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">ตารางผ่อนชำระ</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {(installments.data ?? []).length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">ไม่มีงวดผ่อนชำระ</p>
          ) : (
            (installments.data ?? []).map((inst) => {
              const remaining = inst.totalAmount - inst.amountPaid;
              return (
                <div key={inst.id} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                  <div>
                    <p className="font-medium">งวดที่ {inst.installmentNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTh(inst.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{formatBaht(inst.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {inst.status === "PAID" ? "ชำระแล้ว" : `ค้าง ${formatBaht(remaining)}`}
                    </p>
                  </div>
                  <div>
                    {inst.status !== "PAID" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInst(inst);
                          setPayOpen(true);
                        }}
                      >
                        บันทึกชำระ
                      </Button>
                    ) : (
                      <CheckCircle className="size-5 text-success" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>บันทึกชำระงวดที่ {selectedInst?.installmentNumber}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              pay.mutate({
                data: {
                  installmentId: selectedInst!.id,
                  amount: Number(fd.get("amount")),
                  paymentMethod: String(fd.get("paymentMethod") ?? "CASH"),
                },
              });
            }}
          >
            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span>เงินงวด</span>
                <span className="font-mono">{formatBaht(selectedInst?.totalAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>ชำระแล้ว</span>
                <span className="font-mono">{formatBaht(selectedInst?.amountPaid ?? 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>ค้างชำระ</span>
                <span className="font-mono">{formatBaht((selectedInst?.totalAmount ?? 0) - (selectedInst?.amountPaid ?? 0))}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">จำนวนเงินที่ชำระ</Label>
              <Input id="amount" name="amount" type="number" min={1} step="0.01" defaultValue={(selectedInst?.totalAmount ?? 0) - (selectedInst?.amountPaid ?? 0)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">วิธีชำระ</Label>
              <Select id="paymentMethod" name="paymentMethod" defaultValue="CASH">
                <option value="CASH">เงินสด</option>
                <option value="BANK_TRANSFER">โอนเงิน</option>
                <option value="QR_CODE">QR Code</option>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={pay.isPending}>
              บันทึกการชำระ
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaygroundTasks() {
  const q = useQuery({ queryKey: ["playground-tasks"], queryFn: () => listPlaygroundTasks() });
  const customers = useQuery({ queryKey: ["playground-customers"], queryFn: () => listPlaygroundCustomers() });
  const staff = useQuery({ queryKey: ["playground-staff"], queryFn: () => getPlaygroundStaff() });
  const update = useMutation({
    mutationFn: updatePlaygroundTask,
    onSuccess: () => {
      toast.success("อัปเดตงานแล้ว");
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const create = useMutation({
    mutationFn: createPlaygroundTask,
    onSuccess: () => {
      toast.success("สร้างงานใหม่แล้ว");
      setCreateOpen(false);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  if (q.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">เกิดข้อผิดพลาด</p>
        <p className="mt-1 text-sm text-muted-foreground">{q.error.message}</p>
        <Button className="mt-3" onClick={() => void q.refetch()}>ลองใหม่</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">งานเก็บเงินวันนี้</h1>
          <p className="text-sm text-muted-foreground">ติดตามงานและบันทึกยอดเก็บ</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 size-4" /> สร้างงานใหม่
        </Button>
      </div>

      <div className="space-y-2">
        {(q.data ?? []).map((task) => {
          const isExpanded = expandedId === task.id;
          const statusInfo = TASK_STATUS_LABELS[task.status] ?? { label: task.status, tone: "neutral" as const };
          return (
            <Card key={task.id} className="rounded-xl">
              <button
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setExpandedId(isExpanded ? null : task.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">{task.customerName}</p>
                    <p className="text-xs text-muted-foreground">{task.staffName} · {formatDateTh(task.taskDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-sm">{formatBaht(task.amountCollected)} / {formatBaht(task.amountExpected)}</p>
                  <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-border p-4 pt-0">
                  <div className="flex gap-2">
                    {task.status === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => update.mutate({ data: { taskId: task.id, status: "IN_PROGRESS", amountCollected: task.amountExpected * 0.5 } })}>
                          เริ่มเก็บ (50%)
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => update.mutate({ data: { taskId: task.id, status: "PAID", amountCollected: task.amountExpected } })}>
                          เก็บครบ
                        </Button>
                      </>
                    )}
                    {task.status === "IN_PROGRESS" && (
                      <>
                        <Button size="sm" onClick={() => update.mutate({ data: { taskId: task.id, status: "PAID", amountCollected: task.amountExpected } })}>
                          บันทึกเก็บครบ
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => update.mutate({ data: { taskId: task.id, status: "PROBLEM" } })}>
                          มีปัญหา
                        </Button>
                      </>
                    )}
                    {task.status === "PAID" && (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="size-4" /> บันทึกเรียบร้อยแล้ว
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างงานใหม่</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                data: {
                  customerId: String(fd.get("customerId") ?? ""),
                  staffId: String(fd.get("staffId") ?? ""),
                  amountExpected: Number(fd.get("amountExpected")),
                  taskDate: String(fd.get("taskDate") ?? todayISO()),
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="customerId">ลูกค้า</Label>
              <Select id="customerId" name="customerId" required>
                {(customers.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staffId">ผู้รับผิดชอบ</Label>
              <Select id="staffId" name="staffId" required>
                {(staff.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="amountExpected">ยอดที่คาดว่าจะเก็บได้</Label>
                <Input id="amountExpected" name="amountExpected" type="number" min={1} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taskDate">วันที่</Label>
                <Input id="taskDate" name="taskDate" type="date" defaultValue={todayISO()} required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              สร้างงาน
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaygroundProblems() {
  const q = useQuery({ queryKey: ["playground-problems"], queryFn: () => listPlaygroundProblems() });
  const customers = useQuery({ queryKey: ["playground-customers"], queryFn: () => listPlaygroundCustomers() });
  const tasks = useQuery({ queryKey: ["playground-tasks"], queryFn: () => listPlaygroundTasks() });
  const create = useMutation({
    mutationFn: reportPlaygroundProblem,
    onSuccess: () => {
      toast.success("รายงานปัญหาแล้ว");
      setCreateOpen(false);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const resolve = useMutation({
    mutationFn: resolvePlaygroundProblem,
    onSuccess: () => {
      toast.success("แก้ปัญหาแล้ว");
      setResolveOpen(false);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedProb, setSelectedProb] = useState<{ id: string; customerName: string } | null>(null);

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  if (q.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">เกิดข้อผิดพลาด</p>
        <p className="mt-1 text-sm text-muted-foreground">{q.error.message}</p>
        <Button className="mt-3" onClick={() => void q.refetch()}>ลองใหม่</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ปัญหาที่รายงาน</h1>
          <p className="text-sm text-muted-foreground">ติดตามและแก้ไขปัญหาที่พบในการเก็บเงิน</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 size-4" /> รายงานปัญหา
        </Button>
      </div>

      <div className="space-y-2">
        {(q.data ?? []).length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="flex flex-col items-center py-12">
              <AlertTriangle className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">ยังไม่มีปัญหาที่รายงาน</p>
            </CardContent>
          </Card>
        ) : (
          (q.data ?? []).map((prob) => (
            <Card key={prob.id} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{prob.customerName}</p>
                      <Badge tone={prob.status === "REPORTED" ? "danger" : "success"}>
                        {prob.status === "REPORTED" ? "รอแก้ไข" : "แก้แล้ว"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {PROBLEM_TYPES.find((p) => p.value === prob.problemType)?.label ?? prob.problemType}
                    </p>
                    {prob.description && (
                      <p className="mt-1 text-sm">{prob.description}</p>
                    )}
                    {prob.amountInvolved > 0 && (
                      <p className="mt-1 font-mono text-sm">ยอดเกี่ยวข้อง: {formatBaht(prob.amountInvolved)}</p>
                    )}
                  </div>
                  {prob.status === "REPORTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProb(prob);
                        setResolveOpen(true);
                      }}
                    >
                      แก้ไข
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รายงานปัญหา</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                data: {
                  customerId: String(fd.get("customerId") ?? ""),
                  taskId: String(fd.get("taskId") || undefined),
                  problemType: String(fd.get("problemType") ?? ""),
                  description: String(fd.get("description") ?? ""),
                  amountInvolved: Number(fd.get("amountInvolved") || 0) || undefined,
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="customerId">ลูกค้า</Label>
              <Select id="customerId" name="customerId" required>
                {(customers.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="problemType">ประเภทปัญหา</Label>
              <Select id="problemType" name="problemType" required>
                {PROBLEM_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amountInvolved">ยอดที่เกี่ยวข้อง (ถ้ามี)</Label>
              <Input id="amountInvolved" name="amountInvolved" type="number" min={0} />
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              รายงานปัญหา
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขปัญหา: {selectedProb?.customerName}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              resolve.mutate({
                data: {
                  problemId: selectedProb!.id,
                  resolutionNote: String(fd.get("resolutionNote") ?? ""),
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="resolutionNote">วิธีแก้ไข</Label>
              <Textarea id="resolutionNote" name="resolutionNote" required />
            </div>
            <Button type="submit" className="w-full" disabled={resolve.isPending}>
              บันทึกการแก้ไข
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaygroundDrillDown() {
  const [level, setLevel] = useState<"area" | "staff">("area");
  const q = useQuery({
    queryKey: ["playground-drilldown", level],
    queryFn: () => getPlaygroundDrillDown({ data: { level } }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drill Down</h1>
        <p className="text-sm text-muted-foreground">เจาะลึกข้อมูลตามระดับต่าง ๆ</p>
      </div>

      <div className="flex gap-2">
        <Button variant={level === "area" ? "default" : "outline"} onClick={() => setLevel("area")}>
          มุมมองตามพื้นที่
        </Button>
        <Button variant={level === "staff" ? "default" : "outline"} onClick={() => setLevel("staff")}>
          มุมมองตามลูกค้า
        </Button>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">
            {level === "area" ? "สรุปตามพื้นที่/พนักงาน" : "สรุปตามลูกค้า"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {level === "area" ? (
            <div className="space-y-3">
              {(q.data?.data ?? []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{item.taskCount} งาน</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBaht(item.totalCollected)} / {formatBaht(item.totalExpected)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(q.data?.data ?? []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                  <div>
                    <p className="font-medium">{item.customerName}</p>
                    <p className="text-xs text-muted-foreground">{item.staffName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{item.taskCount} งาน</p>
                    <p className="text-xs text-muted-foreground">คาดว่า: {formatBaht(item.totalExpected)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PlaygroundLedger() {
  const q = useQuery({ queryKey: ["playground-ledger"], queryFn: () => getPlaygroundFinancialEvents() });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">บันทึกรายการทางการเงิน</h1>
        <p className="text-sm text-muted-foreground">ประวัติการเปลี่ยนแปลงยอดเงิน (Immutable Ledger)</p>
      </div>

      <Card className="rounded-xl">
        <CardContent className="px-0">
          {(q.data ?? []).length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(q.data ?? []).map((event) => (
                <div key={event.id} className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0">
                  <div className="mt-1">
                    {event.eventType === "PAYMENT" ? (
                      <Banknote className="size-4 text-success" />
                    ) : (
                      <Clock className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}</p>
                      <p className="font-mono text-sm">{formatBaht(event.amount)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.customerName ?? "—"} · {event.actorName ?? "—"} · {formatDateTh(event.eventDate)}
                    </p>
                    {event.note && <p className="mt-1 text-xs">{event.note}</p>}
                    {event.balanceBefore !== undefined && event.balanceAfter !== undefined && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        ยอดก่อน: {formatBaht(event.balanceBefore)} → ยอดหลัง: {formatBaht(event.balanceAfter)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  PAYMENT: "รับชำระเงิน",
  LATE_FEE: "ค่าปรับ",
  DISCOUNT: "ส่วนลด",
  RESCHEDULE: "ปรับตาราง",
  ADJUSTMENT: "ปรับยอด",
  LOAN: "เงินกู้ใหม่",
};
