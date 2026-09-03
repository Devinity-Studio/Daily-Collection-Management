import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { confirmPayment, getBilling, getDashboard, submitPayment } from "@/lib/dcm/server";
import { formatBaht, formatDateTh, METHOD_LABEL, STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/subscription")({ component: BillingPage });

function BillingPage() {
  const qc = useQueryClient();
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const q = useQuery({ queryKey: ["billing"], queryFn: () => getBilling() });
  const [method, setMethod] = useState("QR_CODE");
  const [ref, setRef] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      submitPayment({
        data: { paymentMethod: method, paymentReference: ref },
      }),
    onSuccess: () => {
      toast.success("แจ้งชำระเงินแล้ว รอการยืนยัน");
      setRef("");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const confirm = useMutation({
    mutationFn: (payload: { paymentId: string; reject?: boolean }) =>
      confirmPayment({ data: payload }),
    onSuccess: () => {
      toast.success("อัปเดตรายการชำระแล้ว");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sub = q.data?.subscription;

  return (
    <Protected tenantName={dash.data?.tenant.name}>
      <h1 className="text-2xl font-semibold tracking-tight">สมาชิกและการชำระเงิน</h1>
      <p className="text-sm text-muted-foreground">แพ็กเกจรายเดือน 5,000 บาท — ยืนยันการโอนด้วยตนเองในรุ่นทดลองนี้</p>

      {sub ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="rounded-xl">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>แพ็กเกจปัจจุบัน</CardTitle>
              <Badge tone={sub.status === "ACTIVE" ? "success" : "warn"}>
                {STATUS_LABEL[sub.status] ?? sub.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row k="แผน" v={sub.planName} />
              <Row k="ค่าบริการ" v={`${formatBaht(sub.price)} / เดือน`} />
              <Row k="เริ่มต้น" v={formatDateTh(sub.startDate)} />
              <Row k="หมดอายุ" v={formatDateTh(sub.expiryDate)} />
              <Row k="เหลือ" v={`${sub.daysRemaining} วัน`} />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>ชำระค่าบริการรอบถัดไป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">โอนเข้าบัญชี</p>
                <p className="mt-1 font-mono text-sm">ธนาคารกสิกรไทย 123-4-56789-0</p>
                <p className="text-sm text-muted-foreground">บจก. เงินวัน · {formatBaht(sub.price)}</p>
              </div>
              <QrBlock />
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit.mutate();
                }}
              >
                <div className="space-y-1.5">
                  <Label>ช่องทาง</Label>
                  <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="QR_CODE">QR Code</option>
                    <option value="BANK_TRANSFER">โอนเงิน</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>เลขที่อ้างอิง / เวลาโอน</Label>
                  <Input value={ref} onChange={(e) => setRef(e.target.value)} required placeholder="เช่น 14:32 / 123456" />
                </div>
                <Button type="submit" className="w-full" disabled={submit.isPending}>
                  แจ้งชำระเงิน
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">กำลังโหลด...</p>
      )}

      <Card className="mt-6 rounded-xl">
        <CardHeader>
          <CardTitle>รายการชำระ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(q.data?.payments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
          ) : (
            q.data!.payments.map((p) => (
              <div key={p.id} className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{formatBaht(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {METHOD_LABEL[p.paymentMethod ?? ""] ?? p.paymentMethod} · {p.paymentReference}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      p.status === "CONFIRMED" ? "success" : p.status === "PENDING" ? "warn" : "danger"
                    }
                  >
                    {STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                  {p.status === "PENDING" ? (
                    <>
                      <Button size="sm" onClick={() => confirm.mutate({ paymentId: p.id })}>
                        ยืนยัน
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirm.mutate({ paymentId: p.id, reject: true })}
                      >
                        ปฏิเสธ
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </Protected>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function QrBlock() {
  const cells = Array.from({ length: 121 }, (_, i) => {
    const x = i % 11;
    const y = Math.floor(i / 11);
    const finder =
      (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    const on = finder || ((x * 7 + y * 13 + 5) % 3 === 0);
    return on;
  });
  return (
    <div className="flex items-center gap-4">
      <div className="grid size-28 grid-cols-11 gap-px rounded-md bg-card p-2 ring-1 ring-border">
        {cells.map((on, i) => (
          <span key={i} className={on ? "bg-ink" : "bg-transparent"} />
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        สแกน QR (จำลอง) หรือโอนตามบัญชีด้านบน แล้วกรอกเลขอ้างอิง
      </p>
    </div>
  );
}
