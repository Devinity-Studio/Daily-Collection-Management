import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Shield, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Protected } from "@/components/app-shell";
import { listMembers, listRoles, addMember, updateMemberRole, removeMember } from "@/lib/dcm/server";
import { ROLE_LABELS, PERMISSION_LABELS, type Role, type MembershipWithUser } from "@/lib/dcm/rbac";

export const Route = createFileRoute("/members")({ component: MembersPage });

function MembersPage() {
  const qc = useQueryClient();
  const members = useQuery({ queryKey: ["members"], queryFn: () => listMembers() });
  const roles = useQuery({ queryKey: ["roles"], queryFn: () => listRoles() });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addMut = useMutation({
    mutationFn: (data: { email: string; roleId: string }) => addMember({ data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["members"] });
      setShowAddForm(false);
    },
  });

  const roleMut = useMutation({
    mutationFn: (data: { membershipId: string; roleId: string }) => updateMemberRole({ data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["members"] });
      setEditingId(null);
    },
  });

  const removeMut = useMutation({
    mutationFn: (membershipId: string) => removeMember({ data: { membershipId } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["members"] }),
  });

  if (members.isLoading || roles.isLoading) {
    return (
      <Protected>
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      </Protected>
    );
  }

  const roleList = (roles.data ?? []) as Role[];
  const memberList = (members.data ?? []) as MembershipWithUser[];

  return (
    <Protected>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">จัดการสมาชิก</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการสิทธิ์การเข้าถึงข้อมูลของสมาชิกในองค์กร
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus className="mr-2 size-4" />
          เชิญสมาชิก
        </Button>
      </div>

      {showAddForm && (
        <Card className="mt-4 rounded-xl">
          <CardContent className="p-5">
            <AddMemberForm
              roles={roleList}
              loading={addMut.isPending}
              error={addMut.error?.message}
              onSubmit={(email, roleId) => addMut.mutate({ email, roleId })}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-sm text-muted-foreground">สมาชิกทั้งหมด</p>
            </div>
            <p className="mt-2 font-mono text-2xl tabular-nums">{memberList.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <p className="text-sm text-muted-foreground">บทบาทที่มี</p>
            </div>
            <p className="mt-2 font-mono text-2xl tabular-nums">{roleList.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <p className="mt-2 font-mono text-2xl tabular-nums">
              {memberList.filter((m) => m.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>สมาชิกในองค์กร</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y divide-border">
            {memberList.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.userName ?? m.userEmail ?? "ไม่ทราบชื่อ"}</p>
                  <p className="text-xs text-muted-foreground">{m.userEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === m.id ? (
                    <EditRoleSelect
                      roles={roleList}
                      currentRoleId={m.roleId}
                      loading={roleMut.isPending}
                      onSelect={(roleId) => roleMut.mutate({ membershipId: m.id, roleId })}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <Badge tone={m.roleName === "Owner" ? "success" : "primary"}>
                      {ROLE_LABELS[m.roleName as keyof typeof ROLE_LABELS] ?? m.roleName}
                    </Badge>
                  )}
                  {editingId !== m.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(m.id)}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                  )}
                  {m.roleName !== "Owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`ลบ ${m.userName ?? m.userEmail} ออกจากองค์กร?`)) {
                          removeMut.mutate(m.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
            {memberList.length === 0 && (
              <li className="px-5 py-6 text-sm text-muted-foreground">ยังไม่มีสมาชิก</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-xl">
        <CardHeader>
          <CardTitle>สิทธิ์ตามบทบาท</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleList.map((role) => (
              <div key={role.id} className="border-b pb-3 last:border-0 last:pb-0">
                <p className="font-medium">
                  {ROLE_LABELS[role.name as keyof typeof ROLE_LABELS] ?? role.name}
                </p>
                {role.description && (
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.permissions.map((p) => (
                    <Badge key={p} tone="neutral" className="text-xs">
                      {PERMISSION_LABELS[p] ?? p}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Protected>
  );
}

function AddMemberForm({
  roles,
  loading,
  error,
  onSubmit,
  onCancel,
}: {
  roles: Role[];
  loading: boolean;
  error?: string;
  onSubmit: (email: string, roleId: string) => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, roleId);
      }}
      className="space-y-3"
    >
      <p className="text-sm font-medium">เชิญสมาชิกใหม่</p>
      <div className="space-y-1.5">
        <Label htmlFor="member-email">อีเมลผู้ใช้</Label>
        <Input
          id="member-email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          ผู้ใช้ต้องสมัครสมาชิกในระบบก่อน แล้วจึงเชิญด้วยอีเมลที่ใช้สมัคร
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="member-role">บทบาท</Label>
        <select
          id="member-role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {ROLE_LABELS[r.name as keyof typeof ROLE_LABELS] ?? r.name} — {r.description}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "กำลังเชิญ..." : "เชิญสมาชิก"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}

function EditRoleSelect({
  roles,
  currentRoleId,
  loading,
  onSelect,
  onCancel,
}: {
  roles: Role[];
  currentRoleId: string;
  loading: boolean;
  onSelect: (roleId: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(currentRoleId);

  return (
    <div className="flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {ROLE_LABELS[r.name as keyof typeof ROLE_LABELS] ?? r.name}
          </option>
        ))}
      </select>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect(value)}
        disabled={loading || value === currentRoleId}
      >
        <Check className="size-3" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <X className="size-3" />
      </Button>
    </div>
  );
}
