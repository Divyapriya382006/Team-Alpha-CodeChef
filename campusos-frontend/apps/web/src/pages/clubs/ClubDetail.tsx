import { Link, useParams } from "react-router-dom";
import { useClub } from "../../hooks/useClubs";
import { useEvents } from "../../hooks/useEvents";
import { useProjects } from "../../hooks/useProjects";
import { useBlogs } from "../../hooks/useBlogs";
import { useGalleryItems } from "../../hooks/useGallery";
import { usePermissions } from "../../hooks/usePermissions";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { EventCard } from "../../components/cards/EventCard";
import { ProjectCard } from "../../components/cards/ProjectCard";
import { BlogCard } from "../../components/cards/BlogCard";
import { ApiError } from "../../lib/apiError";

function SocialLink({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-sm text-muted underline decoration-slate-700 hover:text-brand-300">
      {label}
    </a>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  );
}

export function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { isClubHeadOf, isSuperAdmin } = usePermissions();
  const clubQuery = useClub(id);
  const eventsQuery = useEvents({ clubId: id, limit: 3 });
  const projectsQuery = useProjects({ clubId: id, limit: 3 });
  const blogsQuery = useBlogs({ clubId: id, limit: 3 });
  const galleryQuery = useGalleryItems({ clubId: id, limit: 3 });

  const canManage = isClubHeadOf(id) || isSuperAdmin;

  if (clubQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (clubQuery.isError) {
    const status = clubQuery.error instanceof ApiError ? clubQuery.error.status : 500;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">{status === 404 ? "Club not found" : "Something went wrong"}</h1>
        <Link to="/" className="mt-3 inline-block text-sm text-brand-400 underline hover:text-brand-300">
          Back to clubs
        </Link>
      </div>
    );
  }

  const club = clubQuery.data!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <div className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {club.logoUrl ? (
            <img src={club.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-500/20 text-xl font-semibold text-brand-300 ring-1 ring-inset ring-brand-500/20">
              {club.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold">{club.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">{club.description}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <SocialLink href={club.socialLinks.instagram} label="Instagram" />
              <SocialLink href={club.socialLinks.linkedin} label="LinkedIn" />
              <SocialLink href={club.socialLinks.github} label="GitHub" />
              <SocialLink href={club.socialLinks.website} label="Website" />
            </div>
          </div>
        </div>
        {canManage && (
          <Link to={`/clubs/${club.id}/manage`} className="btn-primary shrink-0">
            Manage club
          </Link>
        )}
      </div>

      {club.facultyDetails && (
        <p className="mt-4 text-sm text-muted">
          <span className="font-medium text-ink">Faculty:</span> {club.facultyDetails}
        </p>
      )}

      <section className="mt-8">
        <h2 className="eyebrow">Departments</h2>
        {club.departments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No departments yet.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {club.departments.map((d) => (
              <span key={d.id} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {d.name}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow">Events</h2>
          <div className="flex items-center gap-3">
            {isClubHeadOf(club.id) && (
              <Link to={`/clubs/${club.id}/manage/events/new`} className="text-sm font-medium text-brand-400 hover:text-brand-300">
                Request event
              </Link>
            )}
            <Link to={`/events?clubId=${club.id}`} className="text-sm text-muted hover:text-ink">
              View all
            </Link>
          </div>
        </div>
        {eventsQuery.isLoading ? (
          <CardGridSkeleton />
        ) : eventsQuery.data && eventsQuery.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {eventsQuery.data.items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="No events yet" />
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow">Projects</h2>
          <div className="flex items-center gap-3">
            {isClubHeadOf(club.id) && (
              <Link to={`/clubs/${club.id}/manage/projects/new`} className="text-sm font-medium text-brand-400 hover:text-brand-300">
                Publish project
              </Link>
            )}
            <Link to={`/projects?clubId=${club.id}`} className="text-sm text-muted hover:text-ink">
              View all
            </Link>
          </div>
        </div>
        {projectsQuery.isLoading ? (
          <CardGridSkeleton />
        ) : projectsQuery.data && projectsQuery.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {projectsQuery.data.items.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="No projects yet" />
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow">Blogs</h2>
          <div className="flex items-center gap-3">
            {isClubHeadOf(club.id) && (
              <Link to={`/clubs/${club.id}/manage/blogs/new`} className="text-sm font-medium text-brand-400 hover:text-brand-300">
                Publish blog
              </Link>
            )}
            <Link to={`/blogs?clubId=${club.id}`} className="text-sm text-muted hover:text-ink">
              View all
            </Link>
          </div>
        </div>
        {blogsQuery.isLoading ? (
          <CardGridSkeleton />
        ) : blogsQuery.data && blogsQuery.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {blogsQuery.data.items.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        ) : (
          <EmptyState title="No blogs yet" />
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow">Gallery</h2>
          <div className="flex items-center gap-3">
            <Link to={`/gallery?clubId=${club.id}`} className="text-sm text-muted hover:text-ink">
              View all
            </Link>
          </div>
        </div>
        {galleryQuery.isLoading ? (
          <CardGridSkeleton />
        ) : galleryQuery.data && galleryQuery.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {galleryQuery.data.items.map((item) => (
              <div key={item.id} className="surface overflow-hidden rounded-xl border border-slate-800 p-0 hover:border-slate-700 transition">
                <img
                  src={item.imageUrl}
                  alt={item.caption || "Gallery image"}
                  className="aspect-video w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                {item.caption && (
                  <p className="p-3 text-xs text-ink truncate">{item.caption}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No gallery images yet" />
        )}
      </section>
    </div>
  );
}
