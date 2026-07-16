import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useChangeUserRole, useUsers } from "../../hooks/useUsers";
import { SearchBar } from "../../components/ui/SearchBar";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { RoleBadge } from "../../components/ui/RoleBadge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { MemberTable, type MemberTableColumn } from "../../components/tables/MemberTable";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";
import type { PlatformRole, UserAdminView } from "../../types";

const PAGE_SIZE = 20;

const ROLE_OPTIONS: { value: PlatformRole; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "FACULTY_COORDINATOR", label: "Faculty Coordinator" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

export function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const usersQuery = useUsers({ search: search || undefined, page, limit: PAGE_SIZE });
  const changeRole = useChangeUserRole();

  const [pendingChange, setPendingChange] = useState<{ user: UserAdminView; role: PlatformRole } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateParams(next: { search?: string; page?: number }) {
    const params = new URLSearchParams(searchParams);
    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
      params.set("page", "1");
    }
    if (next.page !== undefined) params.set("page", String(next.page));
    setSearchParams(params);
  }

  async function confirmChange() {
    if (!pendingChange) return;
    setError(null);
    try {
      await changeRole.mutateAsync({ userId: pendingChange.user.id, platformRole: pendingChange.role });
      setPendingChange(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update role");
      setPendingChange(null);
    }
  }

  // This route is Super-Admin-only (see AppRoutes), so the caller always qualifies for the
  // admin view of GET /users — items are always UserAdminView, never the name/email-only shape.
  const users = (usersQuery.data?.items ?? []) as UserAdminView[];

  const columns: MemberTableColumn<UserAdminView>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium text-slate-200">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "role", header: "Platform role", render: (u) => <RoleBadge role={u.platformRole} /> },
    {
      key: "actions",
      header: "Change role",
      render: (u) => (
        <select
          value={u.platformRole}
          onChange={(e) => setPendingChange({ user: u, role: e.target.value as PlatformRole })}
          className="field-control !w-auto !py-1 text-sm"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-slate-900">
              {o.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 className="mt-1 text-xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-slate-500">Search users and change platform roles.</p>
        </div>
        <div className="sm:w-72">
          <SearchBar defaultValue={search} placeholder="Search users…" onSearch={(value) => updateParams({ search: value })} />
        </div>
      </div>

      {error && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}

      {usersQuery.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!usersQuery.isLoading && usersQuery.data && usersQuery.data.items.length === 0 && <EmptyState title="No users found" />}

      {!usersQuery.isLoading && usersQuery.data && usersQuery.data.items.length > 0 && (
        <>
          <MemberTable rows={users} columns={columns} getRowKey={(u) => u.id} />
          <Pagination pagination={usersQuery.data.pagination} onPageChange={(p) => updateParams({ page: p })} />
        </>
      )}

      <ConfirmDialog
        open={pendingChange !== null}
        title="Change platform role?"
        message={
          pendingChange
            ? `Set ${pendingChange.user.name}'s role to ${ROLE_OPTIONS.find((o) => o.value === pendingChange.role)?.label}.`
            : ""
        }
        confirmLabel="Confirm"
        isLoading={changeRole.isPending}
        onConfirm={confirmChange}
        onCancel={() => setPendingChange(null)}
      />
    </div>
  );
}
