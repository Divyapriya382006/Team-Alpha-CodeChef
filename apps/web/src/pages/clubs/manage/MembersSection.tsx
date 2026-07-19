import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddClubMember, useClubMembers, useDemoteClubMember, useRemoveClubMember } from "../../../hooks/useClubs";
import { useUserSearch } from "../../../hooks/useUsers";
import { usePermissions } from "../../../hooks/usePermissions";
import { MemberTable, type MemberTableColumn } from "../../../components/tables/MemberTable";
import { RoleBadge } from "../../../components/ui/RoleBadge";
import { SearchBar } from "../../../components/ui/SearchBar";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ApiError } from "../../../lib/apiError";
import type { ClubMember } from "../../../types";

interface MembersSectionProps {
  clubId: string;
}

type PendingAction = { type: "remove"; userId: string; name: string } | { type: "leave"; userId: string } | null;

export function MembersSection({ clubId }: MembersSectionProps) {
  const { user } = usePermissions();
  const navigate = useNavigate();
  const membersQuery = useClubMembers(clubId, { limit: 50 });
  const addMember = useAddClubMember(clubId);
  const removeMember = useRemoveClubMember(clubId);
  const demoteMember = useDemoteClubMember(clubId);

  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useUserSearch({ search: searchTerm, limit: 5 });

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const members = membersQuery.data?.items ?? [];
  const existingMemberIds = new Set(members.map((m) => m.userId));

  async function handleAdd(userId: string) {
    setActionError(null);
    try {
      await addMember.mutateAsync(userId);
      setSearchTerm("");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not add member");
    }
  }

  async function handleDemote(userId: string) {
    setActionError(null);
    try {
      await demoteMember.mutateAsync(userId);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not update role");
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    setActionError(null);
    try {
      await removeMember.mutateAsync(pendingAction.userId);
      if (pendingAction.type === "leave") navigate("/");
      setPendingAction(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not remove member");
      setPendingAction(null);
    }
  }

  const columns: MemberTableColumn<ClubMember>[] = [
    { key: "name", header: "Name", render: (m) => <span className="font-medium text-slate-200">{m.name}</span> },
    { key: "email", header: "Email", render: (m) => ("email" in m ? m.email : "—") },
    { key: "role", header: "Role", render: (m) => <RoleBadge role={m.role} /> },
    {
      key: "actions",
      header: "",
      render: (m) => (
        <div className="flex justify-end gap-3">
          {m.role === "CLUB_HEAD" ? (
            <span className="text-xs text-slate-500">Club Head</span>
          ) : (
            <button type="button" onClick={() => handleDemote(m.userId)} className="text-xs font-medium text-slate-400 hover:text-slate-200">
              Demote
            </button>
          )}
          {m.userId === user?.id ? (
            <button
              type="button"
              onClick={() => setPendingAction({ type: "leave", userId: m.userId })}
              className="text-xs font-medium text-rose-400 hover:text-rose-300"
            >
              Leave
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPendingAction({ type: "remove", userId: m.userId, name: m.name })}
              className="text-xs font-medium text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="surface p-6">
      <h2 className="text-base font-semibold text-white">Members</h2>

      <div className="mt-4">
        <SearchBar placeholder="Search users to add…" onSearch={setSearchTerm} />
        {searchTerm && (
          <div className="surface mt-2 divide-y divide-slate-800">
            {searchResults.isLoading && <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>}
            {searchResults.data?.items
              .filter((u) => !existingMemberIds.has(u.id))
              .map((u) => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
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
              <p className="px-3 py-2 text-sm text-slate-500">No matching users.</p>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <p className="mt-3 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{actionError}</p>
      )}

      <div className="mt-4">
        {membersQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <MemberTable rows={members} columns={columns} getRowKey={(m) => m.userId} emptyMessage="No members yet." />
        )}
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.type === "leave" ? "Leave this club?" : "Remove member?"}
        message={
          pendingAction?.type === "leave"
            ? "You'll lose your membership and any role in this club."
            : `${pendingAction?.type === "remove" ? pendingAction.name : "This member"} will be removed from the club.`
        }
        confirmLabel={pendingAction?.type === "leave" ? "Leave" : "Remove"}
        isDestructive
        isLoading={removeMember.isPending}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
