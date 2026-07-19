import { useSearchParams } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useClubs } from "../../hooks/useClubs";
import { SearchBar } from "../../components/ui/SearchBar";
import { FormSelect } from "../../components/ui/FormField";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProjectCard } from "../../components/cards/ProjectCard";
import { Skeleton } from "../../components/ui/Skeleton";

const PAGE_SIZE = 12;

export function ProjectDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const clubId = searchParams.get("clubId") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const clubsQuery = useClubs({ limit: 100 });
  const { data, isLoading, isError, refetch } = useProjects({ search: search || undefined, clubId, page, limit: PAGE_SIZE });

  function updateParams(next: { search?: string; clubId?: string; page?: number }) {
    const params = new URLSearchParams(searchParams);
    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
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
          <span className="eyebrow">Built here</span>
          <h1 style={{color: '#0A0A0A'}} className="mt-2 text-3xl font-bold tracking-tight">Projects</h1>
          <p style={{color: '#555555'}} className="mt-2 text-sm">Browse projects published by campus clubs.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:flex-1">
            <SearchBar defaultValue={search} placeholder="Search projects…" onSearch={(value) => updateParams({ search: value })} />
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
        <div className="surface border-2 border-ink bg-white px-4 py-6 text-center shadow-brutal rounded-none">
          <p className="text-sm font-bold" style={{color: '#FF3B3B'}}>Couldn't load projects.</p>
          <button type="button" onClick={() => refetch()} className="btn-ghost mt-2 !px-2 !py-1 text-xs underline font-bold">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState title="No projects found" description={search ? `No projects match "${search}".` : "Check back later."} />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Pagination pagination={data.pagination} onPageChange={(p) => updateParams({ page: p })} />
        </>
      )}
    </div>
  );
}
