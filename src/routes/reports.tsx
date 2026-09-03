import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Protected } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDailyReport, getDashboard, getMonthlyReport } from "@/lib/dcm/server";
import { formatBaht, formatDateLongTh, METHOD_LABEL, todayISO } from "@/lib/format";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

function ReportsPage() {
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const today = todayISO();
  const [date, setDate] = useState(today);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  const daily = useQuery({
    queryKey: ["report-daily", date],
    queryFn: () => getDailyReport({ data: { date } }),
  });
  const [y, m] = month.split("-").map(Number);
  const monthly = useQuery({
    queryKey: ["report-monthly", y, m],
    queryFn: () => getMonthlyReport({ data: { year: y!, month: m! } }),
  });

  return (
    <Protected tenantName={dash.data?.tenant.name}>
      <h1 className="text-2xl font-semibold tracking-tight">รายงาน</h1>
      <p className="text-sm text-muted-foreground">สรุปยอดรายวันและรายเดือน</p>

      <Tabs defaultValue="daily" className="mt-6">
        <TabsList>
          <TabsTrigger value="daily">รายวัน</TabsTrigger>
          <TabsTrigger value="monthly">รายเดือน</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="mb-4 max-w-xs space-y-1.5">
            <Label>วันที่</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {daily.data ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Summary label="รวมทั้งวัน" value={formatBaht(daily.data.totalAmount)} />
                <Summary label="จำนวนรายการ" value={String(daily.data.totalCount)} />
                <Summary label="วันที่" value={formatDateLongTh(daily.data.date)} />
              </div>
              <Card className="mt-4 rounded-xl">
                <CardHeader>
                  <CardTitle>แยกช่องทาง</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daily.data.byMethod.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
                  ) : (
                    daily.data.byMethod.map((r) => (
                      <div key={r.method} className="flex justify-between text-sm">
                        <span>{METHOD_LABEL[r.method] ?? r.method}</span>
                        <span className="font-mono tabular-nums">
                          {formatBaht(r.amount)} · {r.count} รายการ
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          )}
        </TabsContent>
        <TabsContent value="monthly">
          <div className="mb-4 max-w-xs space-y-1.5">
            <Label>เดือน</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          {monthly.data ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Summary label="ยอดรวมเดือน" value={formatBaht(monthly.data.totalAmount)} />
                <Summary label="จำนวนรายการ" value={String(monthly.data.totalCount)} />
              </div>
              <Card className="mt-4 rounded-xl">
                <CardHeader>
                  <CardTitle>แนวโน้มรายวัน</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  {monthly.data.byDay.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthly.data.byDay.map((d) => ({ ...d, day: d.date.slice(8) }))}>
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip formatter={(v: number) => formatBaht(v)} />
                        <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>แยกช่องทาง</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {monthly.data.byMethod.map((r) => (
                      <div key={r.method} className="flex justify-between text-sm">
                        <span>{METHOD_LABEL[r.method] ?? r.method}</span>
                        <span className="font-mono tabular-nums">{formatBaht(r.amount)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>ลูกค้าที่ยอดสูง</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {monthly.data.topCustomers.map((r) => (
                      <div key={r.name} className="flex justify-between text-sm">
                        <span className="truncate pr-3">{r.name}</span>
                        <span className="font-mono tabular-nums">{formatBaht(r.amount)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          )}
        </TabsContent>
      </Tabs>
    </Protected>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 font-mono text-2xl font-medium tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
