import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useDeleteProject, useProject } from "../../hooks/useProjects";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_STYLE: Record<string, string> = {
  IN_PROGRESS: "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  ARCHIVED: "bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700",
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isClubHeadOf } = usePermissions();
  const projectQuery = useProject(id);
  const deleteProject = useDeleteProject();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (projectQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (projectQuery.isError) {
    const status = projectQuery.error instanceof ApiError ? projectQuery.error.status : 500;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-white">{status === 404 ? "Project not found" : "Something went wrong"}</h1>
        <Link to="/projects" className="mt-3 inline-block text-sm text-brand-400 hover:text-brand-300">
          Back to projects
        </Link>
      </div>
    );
  }

  const project = projectQuery.data!;
  const canManage = !!user && (user.id === project.createdBy || isClubHeadOf(project.clubId));

  async function handleDelete() {
    setError(null);
    try {
      await deleteProject.mutateAsync(project.id);
      navigate("/projects");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete project");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <div className="surface p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">{project.title}</h1>
          <span className={`badge shrink-0 ${STATUS_STYLE[project.status]}`}>{STATUS_LABEL[project.status]}</span>
        </div>
        <p className="mt-3 text-sm text-slate-400">{project.description}</p>

        {project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span key={tech} className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-slate-400">
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.contributors.length > 0 && (
          <div className="mt-4">
            <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Contributors</p>
            <p className="mt-1 text-sm text-slate-300">{project.contributors.join(", ")}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-sm text-brand-400 hover:text-brand-300">
              GitHub
            </a>
          )}
          {project.demoLink && (
            <a href={project.demoLink} target="_blank" rel="noreferrer" className="text-sm text-brand-400 hover:text-brand-300">
              Live demo
            </a>
          )}
        </div>

        {error && <p className="mt-4 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}

        {canManage && (
          <div className="mt-5 flex gap-2 border-t border-slate-800 pt-4">
            <Link to={`/clubs/${project.clubId}/manage/projects/${project.id}/edit`} className="btn-secondary !px-3 !py-1.5 text-xs">
              Edit
            </Link>
            <button type="button" onClick={() => setConfirmDelete(true)} className="btn-danger !px-3 !py-1.5 text-xs">
              Delete
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this project?"
        message="This can't be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteProject.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
