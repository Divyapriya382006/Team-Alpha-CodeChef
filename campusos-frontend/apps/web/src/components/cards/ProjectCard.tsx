import { Link } from "react-router-dom";
import type { ProjectSummary } from "../../types";

const STATUS_LABEL: Record<ProjectSummary["status"], string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_STYLE: Record<ProjectSummary["status"], string> = {
  IN_PROGRESS: "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  ARCHIVED: "bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700",
};

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`} className="surface-interactive group flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100 transition group-hover:text-white">{project.title}</h3>
        <span className={`badge shrink-0 ${STATUS_STYLE[project.status]}`}>{STATUS_LABEL[project.status]}</span>
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm text-slate-400">{project.description}</p>
      {project.techStack.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-slate-800 pt-3">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400">
              {tech}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
