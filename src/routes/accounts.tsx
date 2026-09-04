import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/app-shell";
import { PaywallBanner } from "@/components/paywall";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAccount,
  getAccountInstallments,
  getAccountSummary,
  getDashboard,
  listAccounts,
  listCustomers,
  recordInstallmentPayment,
  saveAccount,
} from "@/lib/dcm/server";
import type { Account, Installment } from "@/lib/dcm/types";
import { formatBaht, formatDateTh, todayISO } from "@/lib/format";
import { ArrowLeft, Landmark, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/accounts")({ component: AccountsPage });

function AccountsPage() {
  const qc = useQueryClient();
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const customers = useQuery({ queryKey: ["customers"], queryFn: () => listCustomers() });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: () => listAccounts() });
  const summary = useQuery({ queryKey: ["account-summary"], queryFn: () => getAccountSummary() });

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payInstallment, setPayInstallment] = useState<Installment | null>(null);

  const locked = dash.data?.locked ?? false;

  const save = useMutation({
    mutationFn: saveAccount,
    onSuccess: () => {
      toast.success("บันทึกบัญชีแล้ว");
      setOpen(false);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAccount({ data: { id } }),
    onSuccess: () => {
      toast.success("ลบบัญชีแล้ว");
      setSelectedId(null);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectedAccount = useMemo(
    () => (accounts.data ?? []).find((a) => a.id === selectedId) ?? null,
    [accounts.data, selectedId],
  );

  if (selectedAccount) {
    return (
      <AccountDetail
        account={selectedAccount}
        onBack={() => setSelectedId(null)}
        locked={locked}
        tenantName={dash.data?.tenant.name}
        onPayInstallment={setPayInstallment}
        payInstallment={payInstallment}
        qc={qc}
      />
    );
  }

  return (
    <Protected tenantName={dash.data?.tenant.name}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">บัญชีเงินกู้</h1>
          <p className="text-sm text-muted-foreground">จัดการสินเชื่อและยอดผ่อนชำระของลูกค้า</p>
        </div>
        <Button disabled={locked} onClick={() => setOpen(true)}>
          <Plus className="mr-1 size-4" />
          เปิดบัญชีใหม่
        </Button>
      </div>

      <PaywallBanner locked={locked} price={dash.data?.subscription.price} />

      {/* Summary cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">บัญชีทั้งหมด</p>
            <p className="mt-2 font-mono text-3xl tabular-nums">{summary.data?.totalAccounts ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              ACTIVE {summary.data?.activeAccounts ?? 0} · OVERDUE {summary.data?.overdueAccounts ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">ยอดเงินต้นรวม</p>
            <p className="mt-2 font-mono text-2xl tabular-nums">{formatBaht(summary.data?.totalOriginal ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">ค้างชำระ</p>
            <p className="mt-2 font-mono text-2xl tabular-nums text-destructive">
              {formatBaht(summary.data?.totalOutstanding ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account list */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        {(accounts.data ?? []).length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Landmark className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ยังไม่มีบัญชีเงินกู้</p>
            <p className="text-xs text-muted-foreground">กดปุ่ม &quot;เปิดบัญชีใหม่&quot; เพื่อเริ่มต้น</p>
          </div>
        ) : (
          (accounts.data ?? []).map((a) => (
            <button
              key={a.id}
              className="flex w-full flex-col gap-2 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
              onClick={() => setSelectedId(a.id)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.customerName}</p>
                  <span className="text-xs text-muted-foreground">{a.accountNumber}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ACCOUNT_TYPE_LABEL[a.accountType] ?? a.accountType} · {a.termMonths ?? "?"} เดือน · ดอก {a.interestRate}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums">{formatBaht(a.outstandingBalance)}</p>
                  <p className="text-xs text-muted-foreground">
                    จาก {formatBaht(a.originalAmount)}
                  </p>
                </div>
                <Badge
                  tone={
                    a.status === "ACTIVE"
                      ? "success"
                      : a.status === "PAID_OFF"
                        ? "primary"
                        : a.status === "CLOSED"
                          ? "neutral"
                          : "danger"
                  }
                >
                  {ACCOUNT_STATUS_LABEL[a.status] ?? a.status}
                </Badge>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>เปิดบัญชีเงินกู้ใหม่</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                data: {
                  customerId: String(fd.get("customerId") ?? ""),
                  accountType: String(fd.get("accountType") ?? "PERSONAL_LOAN") as any,
                  originalAmount: Number(fd.get("originalAmount")),
                  interestRate: Number(fd.get("interestRate") || 0),
                  termMonths: Number(fd.get("termMonths")),
                  paymentFrequency: String(fd.get("paymentFrequency") ?? "MONTHLY"),
                  disbursementDate: String(fd.get("disbursementDate") ?? todayISO()),
                  firstDueDate: String(fd.get("firstDueDate") || undefined) || undefined,
                  notes: String(fd.get("notes") ?? ""),
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="customerId">ลูกค้า</Label>
              <Select id="customerId" name="customerId" required>
                {(customers.data ?? [])
                  .filter((c) => c.status === "ACTIVE")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="accountType">ประเภทสินเชื่อ</Label>
                <Select id="accountType" name="accountType" defaultValue="PERSONAL_LOAN">
                  <option value="PERSONAL_LOAN">สินเชื่อบุคคล</option>
                  <option value="BUSINESS_LOAN">สินเชื่อธุรกิจ</option>
                  <option value="CREDIT_LINE">วงเงินเครดิต</option>
                  <option value="OTHER">อื่น ๆ</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="originalAmount">เงินต้น (บาท)</Label>
                <Input id="originalAmount" name="originalAmount" type="number" min={1} step="0.01" required />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="termMonths">ระยะเวลา (เดือน)</Label>
                <Input id="termMonths" name="termMonths" type="number" min={1} defaultValue={12} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interestRate">ดอกเบี้ย (%/ปี)</Label>
                <Input id="interestRate" name="interestRate" type="number" min={0} step="0.1" defaultValue={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentFrequency">ความถี่ชำระ</Label>
                <Select id="paymentFrequency" name="paymentFrequency" defaultValue="MONTHLY">
                  <option value="MONTHLY">รายเดือน</option>
                  <option value="WEEKLY">รายสัปดาห์</option>
                  <option value="QUARTERLY">ราย 3 เดือน</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="disbursementDate">วันที่เบิกเงิน</Label>
                <Input id="disbursementDate" name="disbursementDate" type="date" defaultValue={todayISO()} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="firstDueDate">งวดแรกครบกำหนด</Label>
                <Input id="firstDueDate" name="firstDueDate" type="date" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea id="notes" name="notes" />
            </div>

            <Button type="submit" className="w-full" disabled={save.isPending}>
              สร้างบัญชีและตารางผ่อน
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Protected>
  );
}

function AccountDetail({
  account,
  onBack,
  locked,
  tenantName,
  onPayInstallment,
  payInstallment,
  qc,
}: {
  account: Account;
  onBack: () => void;
  locked: boolean;
  tenantName?: string;
  onPayInstallment: (inst: Installment | null) => void;
  payInstallment: Installment | null;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const installments = useQuery({
    queryKey: ["installments", account.id],
    queryFn: () => getAccountInstallments({ data: { accountId: account.id } }),
  });

  const pay = useMutation({
    mutationFn: recordInstallmentPayment,
    onSuccess: () => {
      toast.success("บันทึกการชำระแล้ว");
      onPayInstallment(null);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAccount({ data: { id } }),
    onSuccess: () => {
      toast.success("ลบบัญชีแล้ว");
      onBack();
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const paidCount = (installments.data ?? []).filter((i) => i.status === "PAID").length;
  const totalCount = installments.data?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <Protected tenantName={tenantName}>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> กลับ
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{account.customerName}</h1>
            <Badge
              tone={
                account.status === "ACTIVE"
                  ? "success"
                  : account.status === "PAID_OFF"
                    ? "primary"
                    : "danger"
              }
            >
              {ACCOUNT_STATUS_LABEL[account.status] ?? account.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {account.accountNumber} · {ACCOUNT_TYPE_LABEL[account.accountType]}
          </p>
        </div>
        {!locked && account.status === "ACTIVE" ? (
          <Button variant="destructive" size="sm" onClick={() => { if (confirm("ลบบัญชีนี้?")) remove.mutate(account.id); }}>
            <Trash2 className="mr-1 size-4" /> ลบ
          </Button>
        ) : null}
      </div>

      {/* Summary */}
      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">เงินต้น</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{formatBaht(account.originalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ชำระแล้ว</p>
            <p className="mt-1 font-mono text-lg tabular-nums text-primary">{formatBaht(account.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ค้างชำระ</p>
            <p className="mt-1 font-mono text-lg tabular-nums text-destructive">{formatBaht(account.outstandingBalance)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">งวดที่ผ่าน</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{paidCount}/{totalCount} ({progress}%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Installment schedule */}
      <Card className="mt-5 rounded-xl">
        <CardHeader>
          <CardTitle>ตารางผ่อนชำระ</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {installments.isLoading ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : (installments.data ?? []).length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">ไม่มีงวดผ่อนชำระ</p>
          ) : (
            <>
              {/* Header */}
              <div className="hidden border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-7 sm:gap-2">
                <div>งวด</div>
                <div>กำหนดชำระ</div>
                <div className="text-right">เงินงวด</div>
                <div className="text-right">ชำระแล้ว</div>
                <div className="text-right">ค้าง</div>
                <div>สถานะ</div>
                <div className="text-right">จัดการ</div>
              </div>
              {(installments.data ?? []).map((inst) => {
                const remaining = inst.totalAmount - inst.amountPaid;
                return (
                  <div
                    key={inst.id}
                    className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-7 sm:items-center sm:gap-2"
                  >
                    <div>
                      <span className="font-medium">งวด {inst.installmentNumber}</span>
                    </div>
                    <div className="text-sm">{formatDateTh(inst.dueDate)}</div>
                    <div className="font-mono text-sm tabular-nums sm:text-right">{formatBaht(inst.totalAmount)}</div>
                    <div className="font-mono text-sm tabular-nums sm:text-right">{formatBaht(inst.amountPaid)}</div>
                    <div className="font-mono text-sm tabular-nums sm:text-right">{formatBaht(Math.max(0, remaining))}</div>
                    <div>
                      <Badge tone={inst.status === "PAID" ? "success" : inst.status === "OVERDUE" ? "danger" : "warn"}>
                        {INSTALLMENT_STATUS_LABEL[inst.status] ?? inst.status}
                      </Badge>
                    </div>
                    <div className="sm:text-right">
                      {!locked && account.status === "ACTIVE" && inst.status !== "PAID" && inst.status !== "WAIVED" ? (
                        <Button size="sm" variant="outline" onClick={() => onPayInstallment(inst)}>
                          บันทึกชำระ
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Record payment dialog */}
      <Dialog open={!!payInstallment} onOpenChange={(v) => { if (!v) onPayInstallment(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>บันทึกชำระงวดที่ {payInstallment?.installmentNumber}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              pay.mutate({
                data: {
                  installmentId: payInstallment!.id,
                  amount: Number(fd.get("amount")),
                  paymentMethod: String(fd.get("paymentMethod") ?? "CASH"),
                  note: String(fd.get("note") ?? ""),
                },
              });
            }}
          >
            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between"><span>เงินงวด</span><span className="font-mono">{formatBaht(payInstallment?.totalAmount ?? 0)}</span></div>
              <div className="flex justify-between"><span>ชำระแล้ว</span><span className="font-mono">{formatBaht(payInstallment?.amountPaid ?? 0)}</span></div>
              <div className="flex justify-between font-medium"><span>ค้างชำระ</span><span className="font-mono">{formatBaht((payInstallment?.totalAmount ?? 0) - (payInstallment?.amountPaid ?? 0))}</span></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payAmount">จำนวนเงินที่ชำระ</Label>
              <Input
                id="payAmount"
                name="amount"
                type="number"
                min={1}
                step="0.01"
                defaultValue={(payInstallment?.totalAmount ?? 0) - (payInstallment?.amountPaid ?? 0)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payMethod">วิธีชำระ</Label>
              <Select id="payMethod" name="paymentMethod" defaultValue="CASH">
                <option value="CASH">เงินสด</option>
                <option value="BANK_TRANSFER">โอนเงิน</option>
                <option value="QR_CODE">QR Code</option>
                <option value="OTHER">อื่น ๆ</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payNote">หมายเหตุ</Label>
              <Input id="payNote" name="note" />
            </div>
            <Button type="submit" className="w-full" disabled={pay.isPending}>
              บันทึกการชำระ
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Protected>
  );
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  PERSONAL_LOAN: "สินเชื่อบุคคล",
  BUSINESS_LOAN: "สินเชื่อธุรกิจ",
  CREDIT_LINE: "วงเงินเครดิต",
  OTHER: "อื่น ๆ",
};

const ACCOUNT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "กำลังผ่อน",
  OVERDUE: "เลยกำหนด",
  DELINQUENT: "ค้างชำระ",
  PAID_OFF: "ชำระครบ",
  WRITTEN_OFF: "ตัดหนี้",
  CLOSED: "ปิดบัญชี",
};

const INSTALLMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "รอ",
  CURRENT: "ถึงกำหนด",
  PARTIAL: "จ่ายบางส่วน",
  PAID: "ชำระแล้ว",
  OVERDUE: "เลยกำหนด",
  WAIVED: "ยกเว้น",
};
