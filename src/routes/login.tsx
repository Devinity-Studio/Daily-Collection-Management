import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
              <p className="text-sm text-muted-foreground">เข้าสู่ระบบเพื่อจัดการยอดเก็บเงิน</p>
            </div>
          </div>
          {authEnabled ? (
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  เข้าสู่ระบบด้วย {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ระบบเข้าสู่ระบบยังไม่เปิดใช้งาน</p>
          )}
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
