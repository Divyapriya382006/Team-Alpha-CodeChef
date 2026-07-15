import type { ClubRole, PlatformRole } from "../../types";

type Role = ClubRole | PlatformRole | "DEPARTMENT_HEAD";

const LABELS: Record<Role, string> = {
  CLUB_HEAD: "Club Head",
  MEMBER: "Member",
  SUPER_ADMIN: "Super Admin",
  FACULTY_COORDINATOR: "Faculty Coordinator",
  STUDENT: "Student",
  DEPARTMENT_HEAD: "Department Head",
};

const STYLES: Record<Role, string> = {
  CLUB_HEAD: "bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/30",
  MEMBER: "bg-slate-800 text-slate-300 ring-1 ring-inset ring-slate-700",
  SUPER_ADMIN: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/30",
  FACULTY_COORDINATOR: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  STUDENT: "bg-slate-800 text-slate-300 ring-1 ring-inset ring-slate-700",
  DEPARTMENT_HEAD: "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/30",
};

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={`badge ${STYLES[role]}`}>{LABELS[role]}</span>;
}
