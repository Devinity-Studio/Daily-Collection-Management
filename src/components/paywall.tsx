import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBaht } from "@/lib/format";

export function PaywallBanner({ locked, price = 5000 }: { locked: boolean; price?: number }) {
  if (!locked) return null;
  return (
    <Card className="mb-6 border-warn/30 bg-secondary">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 size-5 text-warn" />
          <div>
            <p className="font-semibold">สิทธิ์การใช้งานหมดอายุ</p>
            <p className="text-sm text-muted-foreground">
              ชำระค่าบริการ {formatBaht(price)} เพื่อเปิดระบบเก็บเงินต่อ
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/subscription">ไปหน้าชำระเงิน</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
