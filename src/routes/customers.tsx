import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { disableCustomer, getDashboard, listCustomers, saveCustomer } from "@/lib/dcm/server";
import type { Customer } from "@/lib/dcm/types";
import { formatBaht } from "@/lib/format";

export const Route = createFileRoute("/customers")({ component: CustomersPage });

function CustomersPage() {
  const qc = useQueryClient();
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const q = useQuery({ queryKey: ["customers"], queryFn: () => listCustomers() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  const save = useMutation({
    mutationFn: saveCustomer,
    onSuccess: () => {
      toast.success("บันทึกลูกค้าแล้ว");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const disable = useMutation({
    mutationFn: (id: string) => disableCustomer({ data: { id } }),
    onSuccess: () => {
      toast.success("ปิดการใช้งานลูกค้าแล้ว");
      void qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const rows = (q.data ?? []).filter((c) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return [c.name, c.phone, c.customerCode].some((v) => (v ?? "").toLowerCase().includes(s));
  });

  return (
    <Protected tenantName={dash.data?.tenant.name}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ลูกค้า</h1>
          <p className="text-sm text-muted-foreground">รายชื่อลูกค้าขององค์กรนี้</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          เพิ่มลูกค้า
        </Button>
      </div>

      <Input
        className="mt-5 max-w-md"
        placeholder="ค้นหาชื่อ เบอร์ หรือรหัส"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-12 gap-3 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground sm:grid">
          <div className="col-span-4">ลูกค้า</div>
          <div className="col-span-3">ติดต่อ</div>
          <div className="col-span-2 text-right">ยอดรวม</div>
          <div className="col-span-3 text-right">จัดการ</div>
        </div>
        {q.isLoading ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">กำลังโหลด...</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">ยังไม่มีลูกค้า</p>
        ) : (
          rows.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-12 sm:items-center sm:gap-3"
            >
              <div className="sm:col-span-4">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.customerCode ?? "ไม่มีรหัส"}</p>
              </div>
              <div className="text-sm text-muted-foreground sm:col-span-3">
                {c.phone ?? "—"}
                <div className="truncate text-xs">{c.address}</div>
              </div>
              <div className="font-mono text-sm tabular-nums sm:col-span-2 sm:text-right">
                {formatBaht(c.totalAmount)}
                <div className="text-xs text-muted-foreground">{c.totalCount} รายการ</div>
              </div>
              <div className="flex items-center gap-2 sm:col-span-3 sm:justify-end">
                <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>
                  {c.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  แก้ไข
                </Button>
                {c.status === "ACTIVE" ? (
                  <Button size="sm" variant="ghost" onClick={() => disable.mutate(c.id)}>
                    ปิดใช้
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save.mutate({
                data: {
                  id: editing?.id,
                  name: String(fd.get("name") ?? ""),
                  customerCode: String(fd.get("code") ?? ""),
                  phone: String(fd.get("phone") ?? ""),
                  address: String(fd.get("address") ?? ""),
                },
              });
            }}
          >
            <Field label="ชื่อลูกค้า" name="name" defaultValue={editing?.name} required />
            <Field label="รหัส" name="code" defaultValue={editing?.customerCode ?? ""} />
            <Field label="โทรศัพท์" name="phone" defaultValue={editing?.phone ?? ""} />
            <div className="space-y-1.5">
              <Label htmlFor="address">ที่อยู่</Label>
              <Textarea id="address" name="address" defaultValue={editing?.address ?? ""} />
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

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} required={required} />
    </div>
  );
}
