import type { ProjectStatus } from "./enums";

// Used in GET /projects list and Search results.
export interface ProjectSummary {
  id: string;
  clubId: string;
  departmentId: string | null;
  title: string;
  description: string;
  techStack: string[];
  thumbnailUrl: string | null;
  status: ProjectStatus;
  createdAt: string;
}

// GET /projects/:id — ProjectSummary + githubLink, demoLink, contributors, createdBy.
export interface ProjectDetail extends ProjectSummary {
  githubLink: string | null;
  demoLink: string | null;
  contributors: string[];
  createdBy: string;
}
