import { Link } from "react-router-dom";
import { RequestStatusBadge } from "../ui/RequestStatusBadge";
import type { EventSummary } from "../../types";

interface EventCardProps {
  event: EventSummary;
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateFmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${startDate.toLocaleDateString(undefined, dateFmt)} · ${startDate.toLocaleTimeString(undefined, timeFmt)}–${endDate.toLocaleTimeString(undefined, timeFmt)}`;
}

export function EventCard({ event }: EventCardProps) {
  const isFull = event.capacity !== null && event.registeredCount >= event.capacity;

  return (
    <Link to={`/events/${event.id}`} className="surface-interactive group flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100 transition group-hover:text-white">{event.title}</h3>
        <RequestStatusBadge status={event.status} />
      </div>
      <p className="mt-1.5 font-mono text-xs text-slate-500">
        {formatDateRange(event.startTime, event.endTime)} · {event.location}
      </p>
      <p className="mt-2.5 line-clamp-2 text-sm text-slate-400">{event.description}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-2 border-t border-slate-800 pt-3 text-xs text-slate-500">
        <span className={event.type === "PUBLIC" ? "text-cyan-400" : "text-brand-400"}>
          {event.type === "PUBLIC" ? "Public" : "Club Exclusive"}
        </span>
        <span className="text-slate-700">·</span>
        <span>
          {event.registeredCount}
          {event.capacity !== null ? ` / ${event.capacity}` : ""} registered{isFull ? " · Full" : ""}
        </span>
      </div>
    </Link>
  );
}
