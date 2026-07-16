import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useAnnouncement, useAnnouncements, useDeleteAnnouncement } from "../../hooks/useAnnouncements";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";
import type { AnnouncementSummary } from "../../types";

const PAGE_SIZE = 20;

const VISIBILITY_STYLE: Record<string, string> = {
  GLOBAL: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/30",
  CLUB: "bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/30",
  DEPARTMENT: "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/30",
};

// No "Announcement Detail" page is defined in FINAL_TEAM_BUILD_GUIDE.md's 23-page list (only
// Feed and Create), even though GET /announcements/:id is a real, required endpoint. Rather than
// inventing a route the build guide doesn't ask for, content is revealed in place via that
// endpoint on click.
function AnnouncementRow({ announcement, onDelete }: { announcement: AnnouncementSummary; onDelete: (id: string) => void }) {
  const { user } = useAuthContext();
  const { isClubHeadOf, isSuperAdmin } = usePermissions();
  const [expanded, setExpanded] = useState(false);
  const detailQuery = useAnnouncement(expanded ? announcement.id : undefined);

  const canDelete =
    !!user && (user.id === announcement.createdBy || isSuperAdmin || (announcement.clubId ? isClubHeadOf(announcement.clubId) : false));

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => setExpanded((e) => !e)} className="text-left text-sm font-semibold text-slate-100 hover:text-white">
          {announcement.title}
        </button>
        <span className={`badge shrink-0 ${VISIBILITY_STYLE[announcement.visibility]}`}>{announcement.visibility}</span>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-500">
        {new Date(announcement.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>

      {expanded &&
        (detailQuery.isLoading ? (
          <Skeleton className="mt-3 h-12 w-full" />
        ) : detailQuery.data ? (
          <p className="mt-3 whitespace-pre-wrap border-t border-slate-800 pt-3 text-sm text-slate-300">{detailQuery.data.content}</p>
        ) : null)}

      {canDelete && (
        <button type="button" onClick={() => onDelete(announcement.id)} className="mt-2 text-xs font-medium text-rose-400 hover:text-rose-300">
          Delete
        </button>
      )}
    </div>
  );
}

export function AnnouncementFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const announcementsQuery = useAnnouncements({ page, limit: PAGE_SIZE });
  const deleteAnnouncement = useDeleteAnnouncement();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updatePage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setError(null);
    try {
      await deleteAnnouncement.mutateAsync(pendingDelete);
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete announcement");
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Feed</span>
          <h1 className="mt-1 text-xl font-semibold text-white">Announcements</h1>
          <p className="text-sm text-slate-500">Global updates plus posts from your clubs and departments.</p>
        </div>
        <Link to="/announcements/new" className="btn-primary shrink-0">
          New announcement
        </Link>
      </div>

      {error && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}

      {announcementsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {announcementsQuery.isError && !announcementsQuery.isLoading && (
        <div className="surface border-rose-900/50 px-4 py-6 text-center">
          <p className="text-sm text-rose-300">Couldn't load announcements.</p>
        </div>
      )}

      {!announcementsQuery.isLoading && !announcementsQuery.isError && announcementsQuery.data && announcementsQuery.data.items.length === 0 && (
        <EmptyState title="No announcements yet" />
      )}

      {!announcementsQuery.isLoading && !announcementsQuery.isError && announcementsQuery.data && announcementsQuery.data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {announcementsQuery.data.items.map((a) => (
              <AnnouncementRow key={a.id} announcement={a} onDelete={setPendingDelete} />
            ))}
          </div>
          <Pagination pagination={announcementsQuery.data.pagination} onPageChange={updatePage} />
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this announcement?"
        message="This can't be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteAnnouncement.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
