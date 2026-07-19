import { Link } from "react-router-dom";
import type { ProjectSummary } from "../../types";

const STATUS_LABEL: Record<ProjectSummary["status"], string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_STYLE: Record<ProjectSummary["status"], string> = {
  IN_PROGRESS: "bg-[#F5A623] text-ink border border-ink",
  COMPLETED: "bg-brand text-ink border border-ink",
  ARCHIVED: "bg-[#E8E3DB] text-[#555555] border border-ink",
};

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`} className="surface-interactive group flex flex-col p-5 bg-white border-2 border-ink shadow-brutal hover:shadow-brutal-lg transition-all duration-100 rounded-none">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold font-display text-ink">{project.title}</h3>
        <span className={`badge shrink-0 rounded-none font-sans font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${STATUS_STYLE[project.status]}`}>{STATUS_LABEL[project.status]}</span>
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm text-muted">{project.description}</p>
      {project.techStack.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t-2 border-ink pt-3">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="badge bg-paper text-ink border border-ink rounded-none text-[10px] px-1.5 py-0.5 font-mono">
              {tech}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
