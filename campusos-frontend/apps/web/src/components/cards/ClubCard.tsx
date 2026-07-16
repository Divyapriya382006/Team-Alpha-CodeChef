import { Link } from "react-router-dom";
import { Skeleton } from "../ui/Skeleton";
import type { Club } from "../../types";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link to={`/clubs/${club.id}`} className="surface-interactive group flex flex-col p-5">
      <div className="flex items-center gap-3">
        {club.logoUrl ? (
          <img src={club.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-500/20 font-mono text-sm font-semibold text-brand-300 ring-1 ring-inset ring-brand-500/20">
            {club.name.charAt(0)}
          </div>
        )}
        <h3 className="truncate text-sm font-semibold text-slate-100 transition group-hover:text-white">{club.name}</h3>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-400">{club.description}</p>
    </Link>
  );
}

export function ClubCardSkeleton() {
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}
