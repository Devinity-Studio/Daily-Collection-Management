import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, KeyRound, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token: urlToken } = Route.useSearch();
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
        }),
      });

      const data = (await res.json()) as { message?: string; code?: string };

      if (!res.ok) {
        setError(
          data.code === "INVALID_TOKEN"
            ? "Token ไม่ถูกต้องหรือหมดอายุแล้ว"
            : data.message ?? "ไม่สามารถรีเซ็ตรหัสผ่านได้"
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-4">
        <Card className="w-full max-w-md rounded-xl">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">รีเซ็ตรหัสผ่านสำเร็จ!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
              </p>
            </div>
            <Button className="w-full" onClick={() => (window.location.href = "/login")}>
              ไปหน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4">
      <Card className="w-full max-w-md rounded-xl">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
              <Receipt className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">เงินวัน</p>
              <p className="text-sm text-muted-foreground">ตั้งรหัสผ่านใหม่</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token">Reset Token</Label>
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" />
                <Input
                  id="token"
                  type="text"
                  placeholder="วาง token ที่ได้รับ"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="font-mono text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ได้รับจากหน้ารีเซ็ตรหัสผ่าน หรือจากอีเมล
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังดำเนินการ..." : "รีเซ็ตรหัสผ่าน"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline-offset-4 hover:underline">
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
