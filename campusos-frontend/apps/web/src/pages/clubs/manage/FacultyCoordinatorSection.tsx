import { useState } from "react";
import { useReassignFacultyCoordinator } from "../../../hooks/useClubs";
import { useUserSearch } from "../../../hooks/useUsers";
import { SearchBar } from "../../../components/ui/SearchBar";
import { ApiError } from "../../../lib/apiError";
import type { Club, UserAdminView } from "../../../types";

interface FacultyCoordinatorSectionProps {
  club: Club;
}

function isAdminView(u: { id: string; name: string; email: string } | UserAdminView): u is UserAdminView {
  return "platformRole" in u;
}

export function FacultyCoordinatorSection({ club }: FacultyCoordinatorSectionProps) {
  const reassign = useReassignFacultyCoordinator(club.id);
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useUserSearch({ search: searchTerm, limit: 5 });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleAssign(userId: string) {
    setError(null);
    setSaved(false);
    try {
      await reassign.mutateAsync(userId);
      setSaved(true);
      setSearchTerm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reassign coordinator");
    }
  }

  const candidates = (searchResults.data?.items ?? []).filter((u) => !isAdminView(u) || u.platformRole === "FACULTY_COORDINATOR");

  return (
    <div className="surface p-6">
      <h2 className="text-base font-semibold text-white">Faculty Coordinator</h2>
      <p className="mt-1 text-sm text-slate-500">
        Current coordinator ID: <span className="font-mono text-xs text-slate-400">{club.facultyCoordinatorId ?? "Unassigned"}</span>
      </p>

      {error && <p className="mt-3 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}
      {saved && !error && (
        <p className="mt-3 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          Coordinator reassigned.
        </p>
      )}

      <div className="mt-4">
        <SearchBar placeholder="Search Faculty Coordinators…" onSearch={setSearchTerm} />
        {searchTerm && (
          <div className="surface mt-2 divide-y divide-slate-800">
            {searchResults.isLoading && <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>}
            {candidates.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-200">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAssign(u.id)}
                  disabled={reassign.isPending}
                  className="btn-primary !px-3 !py-1 text-xs"
                >
                  Assign
                </button>
              </div>
            ))}
            {searchResults.data && candidates.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">No matching Faculty Coordinators.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
