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
  GLOBAL: "bg-[#FF3B3B] text-white border border-ink",
  CLUB: "bg-brand text-ink border border-ink",
  DEPARTMENT: "bg-[#F5A623] text-ink border border-ink",
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
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '2px solid #0A0A0A',
        boxShadow: '4px 4px 0px #0A0A0A',
        borderRadius: 0,
      }}
      className="p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          style={{ color: '#0A0A0A', margin: 0, padding: 0 }}
          className="text-left text-sm font-bold font-display hover:underline"
        >
          {announcement.title}
        </button>
        <span className={`badge shrink-0 rounded-none font-sans font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${VISIBILITY_STYLE[announcement.visibility]}`}>{announcement.visibility}</span>
      </div>
      <p style={{ color: '#555555' }} className="mt-1 font-mono text-xs">
        {new Date(announcement.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>

      {expanded &&
        (detailQuery.isLoading ? (
          <Skeleton className="mt-3 h-12 w-full" />
        ) : detailQuery.data ? (
          <p style={{ color: '#555555', borderTop: '2px solid #0A0A0A' }} className="mt-3 whitespace-pre-wrap pt-3 text-sm">{detailQuery.data.content}</p>
        ) : null)}

      {canDelete && (
        <button type="button" onClick={() => onDelete(announcement.id)} style={{ color: '#FF3B3B' }} className="mt-2 text-xs font-bold uppercase hover:underline">
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Feed</span>
          <h1 style={{color: '#0A0A0A'}} className="mt-1 text-xl font-bold font-display">Announcements</h1>
          <p style={{color: '#555555'}} className="text-sm">Global updates plus posts from your clubs and departments.</p>
        </div>
        <Link to="/announcements/new" className="btn-primary btn shrink-0">
          New announcement
        </Link>
      </div>

      {error && (
        <p className="border-2 border-[#FF3B3B] bg-[#FFF0F0] px-3 py-2 text-sm font-semibold" style={{color: '#FF3B3B'}}>{error}</p>
      )}

      {announcementsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {announcementsQuery.isError && !announcementsQuery.isLoading && (
        <div className="surface border-2 border-ink bg-white px-4 py-6 text-center shadow-brutal rounded-none">
          <p className="text-sm font-bold" style={{color: '#FF3B3B'}}>Couldn't load announcements.</p>
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
