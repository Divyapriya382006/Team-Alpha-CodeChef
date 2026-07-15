import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useRemoveClubMember } from "../hooks/useClubs";
import { useMyDepartmentHeadships } from "../hooks/useDepartments";
import { RoleBadge } from "../components/ui/RoleBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ApiError } from "../lib/apiError";
import type { ClubMembership } from "../types";

// Each row targets a different club, so the remove-member mutation (scoped to one clubId) has to
// be instantiated per row rather than once for the whole list.
function MembershipRow({ membership, isDepartmentHead }: { membership: ClubMembership; isDepartmentHead: boolean }) {
  const { user } = useAuthContext();
  const removeMember = useRemoveClubMember(membership.clubId);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    if (!user) return;
    setError(null);
    try {
      await removeMember.mutateAsync(user.id);
      setConfirmLeave(false);
    } catch (err) {
      // e.g. 400 "Cannot remove sole Club Head" if this is their only club headship.
      setError(err instanceof ApiError ? err.message : "Could not leave club");
      setConfirmLeave(false);
    }
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to={`/clubs/${membership.clubId}`} className="text-sm font-medium text-slate-200 hover:text-brand-300">
            {membership.clubName}
          </Link>
          {membership.department && <p className="text-xs text-slate-500">{membership.department.name}</p>}
        </div>
        <div className="flex items-center gap-3">
          {isDepartmentHead && <RoleBadge role="DEPARTMENT_HEAD" />}
          <RoleBadge role={membership.role} />
          <button type="button" onClick={() => setConfirmLeave(true)} className="text-xs font-medium text-rose-400 hover:text-rose-300">
            Leave
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}

      <ConfirmDialog
        open={confirmLeave}
        title="Leave this club?"
        message="You'll lose your membership and any role in this club."
        confirmLabel="Leave"
        isDestructive
        isLoading={removeMember.isPending}
        onConfirm={handleLeave}
        onCancel={() => setConfirmLeave(false)}
      />
    </li>
  );
}

export function Profile() {
  const { user, isLoading } = useAuthContext();
  const departmentIds = (user?.clubMemberships ?? [])
    .map((m) => m.department?.id)
    .filter((id): id is string => !!id);
  const headDepartmentIds = useMyDepartmentHeadships(departmentIds, user?.id);

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Account</span>
        <h1 className="mt-1 text-xl font-semibold text-white">{user.name}</h1>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <div className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Platform role</h2>
          <RoleBadge role={user.platformRole} />
        </div>
      </div>

      <div className="surface p-6">
        <h2 className="text-sm font-semibold text-white">Club memberships</h2>
        {user.clubMemberships.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="You haven't joined any clubs yet" description="Browse the directory to find one." />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-800">
            {user.clubMemberships.map((m) => (
              <MembershipRow
                key={m.clubId}
                membership={m}
                isDepartmentHead={!!m.department && headDepartmentIds.has(m.department.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
