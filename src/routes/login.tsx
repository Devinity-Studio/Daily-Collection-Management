import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt } from "lucide-react";
import { GROK_PROVIDERS, authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <p className="text-lg font-semibold">เงินวัน</p>
      </div>
    );
  }
  if (user) return <Navigate to="/" />;

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
              <p className="text-sm text-muted-foreground">
                เข้าสู่ระบบเพื่อจัดการยอดเก็บเงิน
              </p>
            </div>
          </div>

          {authEnabled && (
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    authClient.signIn.oauth2({
                      providerId: p.providerId,
                      callbackURL: "/",
                    })
                  }
                >
                  เข้าสู่ระบบด้วย {p.label}
                </Button>
              ))}
            </div>
          )}

          <EmailPasswordForm />

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              กลับหน้าแรก
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function EmailPasswordForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (signUpError) {
          setError(signUpError.message ?? "สมัครสมาชิกไม่สำเร็จ");
          return;
        }
        // Auto sign-in after sign-up
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "เข้าสู่ระบบไม่สำเร็จ");
          return;
        }
        window.location.href = "/";
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          return;
        }
        window.location.href = "/";
      }
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t pt-5">
      <p className="text-sm font-medium">
        {isSignUp ? "สมัครสมาชิกใหม่" : "เข้าสู่ระบบด้วยอีเมล"}
      </p>

      {isSignUp && (
        <div className="space-y-1.5">
          <Label htmlFor="name">ชื่อ</Label>
          <Input
            id="name"
            type="text"
            placeholder="ชื่อของคุณ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      )}

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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">รหัสผ่าน</Label>
          {!isSignUp && (
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          )}
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "กำลังดำเนินการ..."
          : isSignUp
            ? "สมัครสมาชิก"
            : "เข้าสู่ระบบ"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            มีบัญชีอยู่แล้ว?{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-foreground"
              onClick={() => {
                setIsSignUp(false);
                setError("");
              }}
            >
              เข้าสู่ระบบ
            </button>
          </>
        ) : (
          <>
            ยังไม่มีบัญชี?{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-foreground"
              onClick={() => {
                setIsSignUp(true);
                setError("");
              }}
            >
              สมัครสมาชิก
            </button>
          </>
        )}
      </p>
    </form>
  );
}
