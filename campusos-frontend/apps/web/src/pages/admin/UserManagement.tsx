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
    { key: "name", header: "Name", render: (u) => <span style={{color: '#0A0A0A', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600}}>{u.name}</span> },
    { key: "email", header: "Email", render: (u) => <span style={{color: '#555555', fontFamily: 'JetBrains Mono, monospace', fontSize: 13}}>{u.email}</span> },
    { key: "role", header: "Platform role", render: (u) => <RoleBadge role={u.platformRole} /> },
    {
      key: "actions",
      header: "Change role",
      render: (u) => (
        <select
          value={u.platformRole}
          onChange={(e) => setPendingChange({ user: u, role: e.target.value as PlatformRole })}
          style={{border: '2px solid #0A0A0A', borderRadius: 0, backgroundColor: '#FFFFFF', color: '#0A0A0A', padding: '6px 10px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13}}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{backgroundColor: '#FFFFFF', color: '#0A0A0A'}}>
              {o.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{color: '#0A0A0A'}} className="mt-1 text-xl font-bold font-display">User Management</h1>
          <p style={{color: '#555555'}} className="text-sm">Search users and change platform roles.</p>
        </div>
        <div className="sm:w-72">
          <SearchBar defaultValue={search} placeholder="Search users…" onSearch={(value) => updateParams({ search: value })} />
        </div>
      </div>

      {error && <p className="border-2 border-[#FF3B3B] bg-[#FFF0F0] px-3 py-2 text-sm font-semibold" style={{color: '#FF3B3B'}}>{error}</p>}

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
