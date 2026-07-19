import { useState } from "react";
import { useTransferClubHead } from "../../../hooks/useClubs";
import { useUserSearch } from "../../../hooks/useUsers";
import { SearchBar } from "../../../components/ui/SearchBar";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ApiError } from "../../../lib/apiError";
import type { Club } from "../../../types";

interface TransferClubHeadSectionProps {
  club: Club;
}

// A Club Head cannot promote anyone to Club Head themself (mockUpdateMemberRole is hard-locked to
// "MEMBER") — this atomic demote-outgoing/promote-incoming action is the only way it happens, and
// it's Super-Admin-only per FINAL_TEAM_BUILD_GUIDE.md. Rendered only for Super Admin in ClubManage.
export function TransferClubHeadSection({ club }: TransferClubHeadSectionProps) {
  const transferHead = useTransferClubHead(club.id);
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useUserSearch({ search: searchTerm, limit: 5 });
  const [pendingUser, setPendingUser] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleConfirm() {
    if (!pendingUser) return;
    setError(null);
    try {
      await transferHead.mutateAsync(pendingUser.id);
      setSaved(true);
      setPendingUser(null);
      setSearchTerm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not transfer Club Head");
      setPendingUser(null);
    }
  }

  return (
    <div className="surface p-6">
      <h2 className="text-base font-semibold text-white">Transfer Club Head</h2>
      <p className="mt-1 text-sm text-slate-500">
        Demotes the current Club Head and promotes the selected user — atomic, and the only way this club's leadership changes.
      </p>

      {error && <p className="mt-3 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}
      {saved && !error && (
        <p className="mt-3 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          Club Head transferred.
        </p>
      )}

      <div className="mt-4">
        <SearchBar placeholder="Search users…" onSearch={setSearchTerm} />
        {searchTerm && (
          <div className="surface mt-2 divide-y divide-slate-800">
            {searchResults.isLoading && <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>}
            {searchResults.data?.items.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-200">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingUser({ id: u.id, name: u.name })}
                  className="btn-danger !px-3 !py-1 text-xs"
                >
                  Make Club Head
                </button>
              </div>
            ))}
            {searchResults.data && searchResults.data.items.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">No matching users.</p>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingUser !== null}
        title="Transfer Club Head?"
        message={pendingUser ? `${pendingUser.name} will become Club Head. The current Club Head will be demoted to Member.` : ""}
        confirmLabel="Transfer"
        isDestructive
        isLoading={transferHead.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setPendingUser(null)}
      />
    </div>
  );
}
