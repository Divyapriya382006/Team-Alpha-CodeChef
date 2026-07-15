import { useSearchParams } from "react-router-dom";
import { useClubs } from "../hooks/useClubs";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { EmptyState } from "../components/ui/EmptyState";
import { ClubCard, ClubCardSkeleton } from "../components/cards/ClubCard";

const PAGE_SIZE = 12;

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading, isError, refetch } = useClubs({ search: search || undefined, page, limit: PAGE_SIZE });

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Directory</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Every club, <span className="gradient-text">one directory</span>.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {data ? `${data.pagination.total} active clubs` : "Browse active clubs on campus"} — find one, or start your own.
          </p>
        </div>
        <div className="sm:w-80">
          <SearchBar defaultValue={search} placeholder="Search clubs…" onSearch={(value) => updateParams({ search: value })} />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClubCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="surface border-rose-900/50 px-4 py-6 text-center">
          <p className="text-sm text-rose-300">Couldn't load clubs.</p>
          <button type="button" onClick={() => refetch()} className="btn-ghost mt-2 !px-2 !py-1 text-xs underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState title="No clubs found" description={search ? `No clubs match "${search}".` : "Check back later."} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
          <Pagination pagination={data.pagination} onPageChange={(p) => updateParams({ page: p })} />
        </>
      )}
    </div>
  );
}
