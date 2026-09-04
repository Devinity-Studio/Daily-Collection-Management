import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, Mail, KeyRound, Copy, Check } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetToken("");

    try {
      // Call Better Auth's forget-password endpoint
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });

      // Better Auth always returns 200 for security (doesn't reveal if email exists)
      // In dev mode, we retrieve the token from the verification table
      // via a custom endpoint to display it on screen
      const tokenRes = await fetch("/api/auth/forgot-password-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (tokenRes.ok) {
        const data = (await tokenRes.json()) as { token?: string };
        if (data.token) {
          setResetToken(data.token);
        } else {
          // Token generated but we can't display it — show generic message
          setError(
            "ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว (但在 dev mode กรุณาตรวจสอบ verification table ในฐานข้อมูล)"
          );
        }
      } else {
        // Fallback: show message that email was sent
        setError(
          "ระบบได้ดำเนินการส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลของคุณ"
        );
      }
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

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
              <p className="text-sm text-muted-foreground">รีเซ็ตรหัสผ่าน</p>
            </div>
          </div>

          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังดำเนินการ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <KeyRound className="size-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    สร้าง Token สำเร็จ!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    คัดลอก token ด้านล่างไปวางในหน้ารีเซ็ตรหัสผ่าน
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Reset Token</Label>
                <div className="flex gap-2">
                  <Input
                    value={resetToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyToken}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="size-4 text-green-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  window.location.href = `/reset-password?token=${encodeURIComponent(resetToken)}`;
                }}
              >
                ไปหน้ารีเซ็ตรหัสผ่าน
              </Button>
            </div>
          )}

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
