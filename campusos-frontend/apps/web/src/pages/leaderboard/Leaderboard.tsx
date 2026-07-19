import { useState } from "react";
import { useLeaderboardClubs, useLeaderboardStudents } from "../../hooks/useLeaderboard";
import { SearchBar } from "../../components/ui/SearchBar";
import { FormSelect } from "../../components/ui/FormField";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import type {
  LeaderboardClubEntry,
  LeaderboardSortMetric,
  LeaderboardStudentEntry,
  Pagination as PaginationData,
} from "../../types";

const TABS = [
  { key: "clubs", label: "Clubs" },
  { key: "students", label: "Students" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const SORT_OPTIONS: { value: LeaderboardSortMetric; label: string }[] = [
  { value: "points", label: "Most Points" },
  { value: "events", label: "Most Events" },
  { value: "projects", label: "Most Projects" },
];

const PAGE_SIZE = 10;

// Top-3 get a subtle medal-tinted background on top of the normal `.surface` card — gold/silver/
// bronze, applied via rank rather than a separate podium widget so it works the same way in every
// tab's list.
function InitialAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="h-8 w-8 shrink-0 border-2 border-ink object-cover rounded-none" />;
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink bg-brand font-display text-xs font-bold text-ink">
      {name.charAt(0)}
    </div>
  );
}

function getRankBadgeStyle(rank: number): string {
  if (rank === 1) return "bg-brand text-ink";
  if (rank === 2) return "bg-[#E8E8E8] text-ink";
  if (rank === 3) return "bg-[#F5A623] text-ink";
  return "bg-white text-ink";
}

export function Leaderboard() {
  const [tab, setTab] = useState<TabKey>("clubs");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LeaderboardSortMetric>("points");
  const [page, setPage] = useState(1);

  function changeTab(next: TabKey) {
    setTab(next);
    setSearch("");
    setSort("points");
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateSort(value: LeaderboardSortMetric) {
    setSort(value);
    setPage(1);
  }

  const clubsQuery = useLeaderboardClubs({ search: search || undefined, sort, page, limit: PAGE_SIZE });
  const studentsQuery = useLeaderboardStudents({ search: search || undefined, sort, page, limit: PAGE_SIZE });

  const activePagination: PaginationData | undefined =
    tab === "clubs" ? clubsQuery.data?.pagination : studentsQuery.data?.pagination;

  const isLoading = tab === "clubs" ? clubsQuery.isLoading : studentsQuery.isLoading;
  const isError = tab === "clubs" ? clubsQuery.isError : studentsQuery.isError;
  const items = tab === "clubs" ? clubsQuery.data?.items : studentsQuery.data?.items;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-brute-in">
      <div className="mb-6">
        <span className="eyebrow">Rankings</span>
        <h1 style={{color: '#0A0A0A'}} className="mt-2 text-3xl font-extrabold font-display tracking-tight">Leaderboard</h1>
        <p style={{color: '#555555'}} className="mt-2 text-sm">
          Active points and rankings generated dynamically based on approved events, active memberships, and project count.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex -space-x-[2px]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => changeTab(t.key)}
            className={`px-6 py-2.5 text-xs font-bold font-sans uppercase tracking-wider border-2 border-ink transition-all duration-100 ${
              tab === t.key
                ? "bg-ink text-brand"
                : "bg-white text-ink hover:bg-brand/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="sm:flex-1">
          <SearchBar defaultValue={search} placeholder={`Search ${tab}…`} onSearch={updateSearch} />
        </div>
        <div className="sm:w-56">
          <FormSelect
            label="Sort by"
            name="sort"
            value={sort}
            onChange={(e) => updateSort(e.target.value as LeaderboardSortMetric)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {isLoading && (
        <div className="border-2 border-ink bg-white p-6 animate-brute-in">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-brute-shimmer border border-ink" />
            ))}
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="surface border-2 border-ink px-4 py-6 text-center bg-white">
          <p className="text-sm text-[#FF3B3B] font-bold">Couldn't load the leaderboard.</p>
        </div>
      )}

      {!isLoading && !isError && (!items || items.length === 0) && (
        <EmptyState title={tab === "clubs" ? "No clubs found" : "No students found"} description="Try a different search." />
      )}

      {!isLoading && !isError && items && items.length > 0 && (
        <div className="overflow-x-auto border-2 border-ink shadow-brutal bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink text-brand font-display font-bold uppercase text-[11px] tracking-wider text-left border-b-2 border-ink select-none">
                <th className="p-3 border-r-2 border-ink w-16 text-center">Rank</th>
                <th className="p-3 border-r-2 border-ink">
                  {tab === "clubs" ? "Club" : "Student"}
                </th>
                {tab === "students" && <th className="p-3 border-r-2 border-ink">Club</th>}
                <th className="p-3 border-r-2 border-ink w-24 text-right">Points</th>
                <th className="p-3 border-r-2 border-ink w-24 text-right">Events</th>
                <th className="p-3 w-28 text-right">
                  {tab === "clubs" ? "Members" : "Projects"}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry, index) => {
                const isEven = index % 2 === 1;
                const rowBg = isEven ? "bg-paper" : "bg-white";
                const rowId = tab === "clubs" ? (entry as LeaderboardClubEntry).clubId : (entry as LeaderboardStudentEntry).userId;

                return (
                  <tr key={rowId} className={`${rowBg} border-b-2 border-ink last:border-b-0 hover:bg-brand/5`}>
                    <td className={`p-3 border-r-2 border-ink text-center font-display font-extrabold text-xs ${getRankBadgeStyle(entry.rank)}`}>
                      {entry.rank}
                    </td>
                    <td className="p-3 border-r-2 border-ink font-sans font-bold text-ink">
                      <div className="flex items-center gap-2">
                        {tab === "clubs" && (
                          <>
                            <InitialAvatar name={entry.name} imageUrl={(entry as LeaderboardClubEntry).logoUrl} />
                            <span>{entry.name}</span>
                          </>
                        )}
                        {tab === "students" && (
                          <>
                            <InitialAvatar name={entry.name} />
                            <span>{entry.name}</span>
                          </>
                        )}
                      </div>
                    </td>
                    {tab === "students" && (
                      <td className="p-3 border-r-2 border-ink font-sans text-xs text-muted">
                        {(entry as LeaderboardStudentEntry).clubName}
                      </td>
                    )}
                    <td className="p-3 border-r-2 border-ink text-right font-mono font-bold text-ink text-xs">
                      {tab === "clubs" ? (entry as LeaderboardClubEntry).totalPoints : (entry as LeaderboardStudentEntry).points}
                    </td>
                    <td className="p-3 border-r-2 border-ink text-right font-mono text-xs text-ink">
                      {tab === "clubs" ? (entry as LeaderboardClubEntry).eventsConducted : (entry as LeaderboardStudentEntry).eventsParticipated}
                    </td>
                    <td className="p-3 text-right font-mono text-xs text-ink">
                      {tab === "clubs" ? (entry as LeaderboardClubEntry).activeMembers : (entry as LeaderboardStudentEntry).projectsPublished}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activePagination && <Pagination pagination={activePagination} onPageChange={setPage} />}
    </div>
  );
}
