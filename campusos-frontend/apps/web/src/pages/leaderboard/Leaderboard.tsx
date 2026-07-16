import { useState, type ReactNode } from "react";
import { useLeaderboardClubs, useLeaderboardStudents } from "../../hooks/useLeaderboard";
import { RankBadge } from "../../components/leaderboard/RankBadge";
import { LeaderboardRowSkeleton } from "../../components/leaderboard/LeaderboardRowSkeleton";
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
const TOP_RANK_STYLE: Record<number, string> = {
  1: "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent",
  2: "border-slate-300/30 bg-gradient-to-r from-slate-300/10 via-transparent to-transparent",
  3: "border-orange-600/40 bg-gradient-to-r from-orange-600/10 via-transparent to-transparent",
};

function rowClassName(rank: number): string {
  return `surface flex items-center gap-4 p-4 ${TOP_RANK_STYLE[rank] ?? ""}`;
}

function InitialAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-500/20 text-sm font-semibold text-brand-300 ring-1 ring-inset ring-brand-500/20">
      {name.charAt(0)}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function ClubRow({ entry }: { entry: LeaderboardClubEntry }) {
  return (
    <div className={rowClassName(entry.rank)}>
      <RankBadge rank={entry.rank} />
      <InitialAvatar name={entry.name} imageUrl={entry.logoUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-100">{entry.name}</p>
      </div>
      <div className="flex items-center gap-5">
        <StatPill label="Points" value={entry.totalPoints} />
        <StatPill label="Events" value={entry.eventsConducted} />
        <StatPill label="Members" value={entry.activeMembers} />
      </div>
    </div>
  );
}

function StudentRow({ entry }: { entry: LeaderboardStudentEntry }) {
  return (
    <div className={rowClassName(entry.rank)}>
      <RankBadge rank={entry.rank} />
      <InitialAvatar name={entry.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-100">{entry.name}</p>
        <p className="truncate text-xs text-slate-500">{entry.clubName}</p>
      </div>
      <div className="flex items-center gap-5">
        <StatPill label="Points" value={entry.points} />
        <StatPill label="Events" value={entry.eventsParticipated} />
        <StatPill label="Projects" value={entry.projectsPublished} />
      </div>
    </div>
  );
}

interface LeaderboardSectionProps<T> {
  isLoading: boolean;
  isError: boolean;
  items: T[] | undefined;
  emptyTitle: string;
  renderRow: (entry: T) => ReactNode;
}

function LeaderboardSection<T>({ isLoading, isError, items, emptyTitle, renderRow }: LeaderboardSectionProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="surface border-rose-900/50 px-4 py-6 text-center">
        <p className="text-sm text-rose-300">Couldn't load the leaderboard.</p>
      </div>
    );
  }
  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} description="Try a different search." />;
  }
  return <div className="space-y-3">{items.map((entry) => renderRow(entry))}</div>;
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-fade-in">
      <div className="mb-6">
        <span className="eyebrow">Rankings</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Leaderboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Mock rankings for now — "points" is a placeholder score with no backend definition yet; real scoring lands once the
          database is wired up.
        </p>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => changeTab(t.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-glow" : "text-slate-400 hover:text-slate-200"
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

      {tab === "clubs" && (
        <LeaderboardSection
          isLoading={clubsQuery.isLoading}
          isError={clubsQuery.isError}
          items={clubsQuery.data?.items}
          emptyTitle="No clubs found"
          renderRow={(entry) => <ClubRow key={entry.clubId} entry={entry} />}
        />
      )}
      {tab === "students" && (
        <LeaderboardSection
          isLoading={studentsQuery.isLoading}
          isError={studentsQuery.isError}
          items={studentsQuery.data?.items}
          emptyTitle="No students found"
          renderRow={(entry) => <StudentRow key={entry.userId} entry={entry} />}
        />
      )}

      {activePagination && <Pagination pagination={activePagination} onPageChange={setPage} />}
    </div>
  );
}
