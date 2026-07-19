import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useAddDepartmentMember, useDepartment, useRemoveDepartmentMember, useSetDepartmentHead } from "../../hooks/useDepartments";
import { useUserSearch } from "../../hooks/useUsers";
import { SearchBar } from "../../components/ui/SearchBar";
import { FormSelect } from "../../components/ui/FormField";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ApiError } from "../../lib/apiError";

export function DepartmentManage() {
  const { deptId } = useParams<{ id: string; deptId: string }>();
  const { user } = useAuthContext();
  const { isClubHeadOf } = usePermissions();
  const departmentQuery = useDepartment(deptId);
  const setHead = useSetDepartmentHead(deptId as string);
  const addMember = useAddDepartmentMember(deptId as string);
  const removeMember = useRemoveDepartmentMember(deptId as string);

  const [searchTerm, setSearchTerm] = useState("");
  // GET /users only allows Club Head/Faculty Coordinator/Super Admin callers — a plain Department
  // Head (a MEMBER, not also Club Head) will get a 403 here even though the write endpoints below
  // do allow them to add/remove members. That's a real contract gap (see lib/mock/departments.ts),
  // not a bug in this page.
  const searchResults = useUserSearch({ search: searchTerm, limit: 5 });
  const [error, setError] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{ userId: string; name: string } | null>(null);

  if (departmentQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (departmentQuery.isError || !departmentQuery.data) {
    return <p className="text-sm text-rose-400">Couldn't load this department.</p>;
  }

  const department = departmentQuery.data;
  const isHeadOfThis = department.headUserId === user?.id;
  const isClubHead = isClubHeadOf(department.clubId);
  const canManageMembers = isClubHead || isHeadOfThis;
  const existingMemberIds = new Set(department.members.map((m) => m.userId));

  async function handleSetHead(value: string) {
    setError(null);
    try {
      await setHead.mutateAsync(value || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update department head");
    }
  }

  async function handleAdd(userId: string) {
    setError(null);
    try {
      await addMember.mutateAsync(userId);
      setSearchTerm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add member");
    }
  }

  async function handleRemove() {
    if (!pendingRemove) return;
    setError(null);
    try {
      await removeMember.mutateAsync(pendingRemove.userId);
      setPendingRemove(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove member");
      setPendingRemove(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Department</span>
        <h1 className="mt-1 text-xl font-semibold">{department.name}</h1>
      </div>

      {error && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}

      {isClubHead && (
        <div className="surface p-6">
          <h2 className="text-base font-semibold">Department Head</h2>
          <p className="mt-1 text-sm text-muted">Must already be a member of this department.</p>
          <div className="mt-3 max-w-xs">
            <FormSelect
              label="Head"
              name="head"
              value={department.headUserId ?? ""}
              onChange={(e) => handleSetHead(e.target.value)}
              options={[{ value: "", label: "Unassigned" }, ...department.members.map((m) => ({ value: m.userId, label: m.name }))]}
            />
          </div>
        </div>
      )}

      <div className="surface p-6">
        <h2 className="text-base font-semibold">Members</h2>

        {canManageMembers && (
          <div className="mt-4">
            <SearchBar placeholder="Search club members to add…" onSearch={setSearchTerm} />
            {searchTerm && (
              <div className="surface mt-2 divide-y divide-slate-800">
                {searchResults.isLoading && <p className="px-3 py-2 text-sm text-muted">Searching…</p>}
                {searchResults.isError && (
                  <p className="px-3 py-2 text-sm text-rose-400">Couldn't search users — you may not have search access.</p>
                )}
                {searchResults.data?.items
                  .filter((u) => !existingMemberIds.has(u.id))
                  .map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium text-ink">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdd(u.id)}
                        disabled={addMember.isPending}
                        className="btn-primary !px-3 !py-1 text-xs"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                {searchResults.data && searchResults.data.items.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted">No matching users.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          {department.members.length === 0 ? (
            <EmptyState title="No members in this department yet" />
          ) : (
            <ul className="divide-y divide-slate-800">
              {department.members.map((m) => (
                <li key={m.userId} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink">
                    {m.name}
                    {m.userId === department.headUserId && <span className="ml-2 text-xs text-brand-400">Head</span>}
                  </span>
                  {canManageMembers && (
                    <button
                      type="button"
                      onClick={() => setPendingRemove({ userId: m.userId, name: m.name })}
                      className="text-xs font-medium text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove member?"
        message={`${pendingRemove?.name ?? "This member"} will be removed from ${department.name}.`}
        confirmLabel="Remove"
        isDestructive
        isLoading={removeMember.isPending}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
