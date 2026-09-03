import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTenant, getDashboard, switchTenant } from "@/lib/dcm/server";
import { formatBaht } from "@/lib/format";

export const Route = createFileRoute("/tenants")({ component: TenantsPage });

function TenantsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const [open, setOpen] = useState(false);

  const create = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      toast.success("สร้างองค์กรแล้ว");
      setOpen(false);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const switchMut = useMutation({
    mutationFn: (tenantId: string) => switchTenant({ data: { tenantId } }),
    onSuccess: () => {
      toast.success("สลับองค์กรแล้ว");
      void qc.invalidateQueries();
    },
  });

  const d = q.data;
  const mrr = (d?.tenants.length ?? 0) * 5000;

  return (
    <Protected tenantName={d?.tenant.name}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">องค์กรในระบบ</h1>
          <p className="text-sm text-muted-foreground">มุมมองผู้ให้บริการ — จัดการหลายบริษัทบนแพลตฟอร์มเดียวกัน</p>
        </div>
        <Button onClick={() => setOpen(true)}>เพิ่มองค์กร</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">จำนวนองค์กร</p>
            <p className="mt-2 font-mono text-3xl tabular-nums">{d?.tenants.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">รายได้รายเดือนโดยประมาณ</p>
            <p className="mt-2 font-mono text-3xl tabular-nums">{formatBaht(mrr)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">รอตรวจชำระ</p>
            <p className="mt-2 font-mono text-3xl tabular-nums">{d?.pendingPayments ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        {(d?.tenants ?? []).map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">รหัส {t.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={t.id === d?.tenant.id ? "primary" : "neutral"}>
                {t.id === d?.tenant.id ? "กำลังใช้" : t.status}
              </Badge>
              {t.id !== d?.tenant.id ? (
                <Button size="sm" variant="outline" onClick={() => switchMut.mutate(t.id)}>
                  สลับไปองค์กรนี้
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มองค์กร</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                data: {
                  name: String(fd.get("name") ?? ""),
                  contactName: String(fd.get("contact") ?? ""),
                  phone: String(fd.get("phone") ?? ""),
                },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อบริษัท</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">ผู้ติดต่อ</Label>
              <Input id="contact" name="contact" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">โทรศัพท์</Label>
              <Input id="phone" name="phone" />
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              สร้างและเปิดใช้งาน
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Protected>
  );
}
