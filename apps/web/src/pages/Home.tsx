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
    <div style={{backgroundColor: '#F5F0E8', minHeight: '100vh', padding: '48px 32px'}}>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Directory</span>
            <h1 style={{fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1, color: '#0A0A0A', textTransform: 'uppercase'}} className="mt-2">
              Every club, one directory.
            </h1>
            <hr style={{border: 'none', borderTop: '3px solid #0A0A0A', margin: '16px 0 32px'}} />
            <p className="mt-2 text-sm" style={{color: '#555555'}}>
              {data ? `${data.pagination.total} active clubs` : "Browse active clubs on campus"} — find one, or start your own.
            </p>
          </div>
          <div className="w-full sm:w-80">
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
          <div className="surface border-2 border-ink px-4 py-6 text-center bg-white">
            <p className="text-sm text-[#FF3B3B] font-bold">Couldn't load clubs.</p>
            <button type="button" onClick={() => refetch()} className="btn-ghost mt-2 !px-2 !py-1 text-xs underline font-bold">
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
    </div>
  );
}
