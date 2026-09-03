import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/app-shell";
import { PaywallBanner } from "@/components/paywall";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteCollection,
  getDashboard,
  listCollections,
  listCustomers,
  saveCollection,
} from "@/lib/dcm/server";
import type { Collection } from "@/lib/dcm/types";
import { formatBaht, formatDateTh, METHOD_LABEL, todayISO } from "@/lib/format";

export const Route = createFileRoute("/collections")({ component: CollectionsPage });

function CollectionsPage() {
  const qc = useQueryClient();
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const customers = useQuery({ queryKey: ["customers"], queryFn: () => listCustomers() });
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [customerId, setCustomerId] = useState("");
  const q = useQuery({
    queryKey: ["collections", dateFrom, dateTo, customerId],
    queryFn: () =>
      listCollections({
        data: { dateFrom, dateTo, customerId: customerId || undefined },
      }),
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);

  const save = useMutation({
    mutationFn: saveCollection,
    onSuccess: () => {
      toast.success("บันทึกยอดเก็บแล้ว");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteCollection({ data: { id } }),
    onSuccess: () => {
      toast.success("ลบรายการแล้ว");
      void qc.invalidateQueries();
    },
  });

  const total = useMemo(
    () => (q.data ?? []).reduce((s, r) => s + r.amount, 0),
    [q.data],
  );
  const locked = dash.data?.locked ?? false;
  const activeCustomers = (customers.data ?? []).filter((c) => c.status === "ACTIVE");

  return (
    <Protected tenantName={dash.data?.tenant.name}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">เก็บเงินรายวัน</h1>
          <p className="text-sm text-muted-foreground">รวมตามตัวกรอง {formatBaht(total)}</p>
        </div>
        <Button
          disabled={locked}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          เพิ่มรายการ
        </Button>
      </div>
      <PaywallBanner locked={locked} price={dash.data?.subscription.price} />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>จากวันที่</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ถึงวันที่</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ลูกค้า</Label>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">ทั้งหมด</option>
            {(customers.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        {q.isLoading ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">กำลังโหลด...</p>
        ) : (q.data ?? []).length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">ไม่พบรายการในช่วงนี้</p>
        ) : (
          (q.data ?? []).map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">{row.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTh(row.collectionDate)} · {METHOD_LABEL[row.paymentMethod]}
                  {row.collectorName ? ` · ${row.collectorName}` : ""}
                </p>
                {row.note ? <p className="text-xs text-muted-foreground">{row.note}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm tabular-nums">{formatBaht(row.amount)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={locked}
                  onClick={() => {
                    setEditing(row);
                    setOpen(true);
                  }}
                >
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={locked}
                  onClick={() => {
                    if (confirm("ลบรายการนี้?")) remove.mutate(row.id);
                  }}
                >
                  ลบ
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "แก้ไขรายการ" : "บันทึกยอดเก็บ"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                data: {
                  id: editing?.id,
                  customerId: String(fd.get("customerId") ?? ""),
                  collectionDate: String(fd.get("collectionDate") ?? todayISO()),
                  amount: Number(fd.get("amount")),
                  paymentMethod: String(fd.get("paymentMethod") ?? "CASH"),
                  collectorName: String(fd.get("collectorName") ?? ""),
                  note: String(fd.get("note") ?? ""),
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="customerId">ลูกค้า</Label>
              <Select
                id="customerId"
                name="customerId"
                defaultValue={editing?.customerId ?? activeCustomers[0]?.id ?? ""}
                required
              >
                {activeCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="collectionDate">วันที่</Label>
                <Input
                  id="collectionDate"
                  name="collectionDate"
                  type="date"
                  defaultValue={editing?.collectionDate ?? todayISO()}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">จำนวนเงิน</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                  step="0.01"
                  defaultValue={editing?.amount ?? ""}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">วิธีชำระ</Label>
                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  defaultValue={editing?.paymentMethod ?? "CASH"}
                >
                  <option value="CASH">เงินสด</option>
                  <option value="BANK_TRANSFER">โอนเงิน</option>
                  <option value="QR_CODE">QR Code</option>
                  <option value="OTHER">อื่น ๆ</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="collectorName">ผู้เก็บ</Label>
                <Input
                  id="collectorName"
                  name="collectorName"
                  defaultValue={editing?.collectorName ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">หมายเหตุ</Label>
              <Textarea id="note" name="note" defaultValue={editing?.note ?? ""} />
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              บันทึก
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Protected>
  );
}
