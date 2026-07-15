import { useSearchParams } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { useClubs } from "../../hooks/useClubs";
import { SearchBar } from "../../components/ui/SearchBar";
import { FormSelect } from "../../components/ui/FormField";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { EventCard } from "../../components/cards/EventCard";
import { Skeleton } from "../../components/ui/Skeleton";
import type { EventType } from "../../types";

const PAGE_SIZE = 12;

export function EventDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") as EventType | null;
  const clubId = searchParams.get("clubId") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const clubsQuery = useClubs({ limit: 100 });
  const { data, isLoading, isError, refetch } = useEvents({
    search: search || undefined,
    type: type ?? undefined,
    clubId,
    page,
    limit: PAGE_SIZE,
  });

  function updateParams(next: { search?: string; type?: string; clubId?: string; page?: number }) {
    const params = new URLSearchParams(searchParams);
    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
      params.set("page", "1");
    }
    if (next.type !== undefined) {
      if (next.type) params.set("type", next.type);
      else params.delete("type");
      params.set("page", "1");
    }
    if (next.clubId !== undefined) {
      if (next.clubId) params.set("clubId", next.clubId);
      else params.delete("clubId");
      params.set("page", "1");
    }
    if (next.page !== undefined) params.set("page", String(next.page));
    setSearchParams(params);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <span className="eyebrow">Calendar</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Events</h1>
          <p className="mt-2 text-sm text-slate-500">Browse approved events across campus.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:flex-1">
            <SearchBar defaultValue={search} placeholder="Search events…" onSearch={(value) => updateParams({ search: value })} />
          </div>
          <div className="sm:w-48">
            <FormSelect
              label="Type"
              name="type"
              value={type ?? ""}
              onChange={(e) => updateParams({ type: e.target.value })}
              options={[
                { value: "", label: "All types" },
                { value: "PUBLIC", label: "Public" },
                { value: "CLUB_EXCLUSIVE", label: "Club Exclusive" },
              ]}
            />
          </div>
          <div className="sm:w-56">
            <FormSelect
              label="Club"
              name="clubId"
              value={clubId ?? ""}
              onChange={(e) => updateParams({ clubId: e.target.value })}
              options={[
                { value: "", label: "All clubs" },
                ...(clubsQuery.data?.items.map((c) => ({ value: c.id, label: c.name })) ?? []),
              ]}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="surface border-rose-900/50 px-4 py-6 text-center">
          <p className="text-sm text-rose-300">Couldn't load events.</p>
          <button type="button" onClick={() => refetch()} className="btn-ghost mt-2 !px-2 !py-1 text-xs underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState title="No events found" description={search ? `No events match "${search}".` : "Check back later."} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Pagination pagination={data.pagination} onPageChange={(p) => updateParams({ page: p })} />
        </>
      )}
    </div>
  );
}
