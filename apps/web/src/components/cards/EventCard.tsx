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
    <Link
      to={`/events/${event.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: '#FFFFFF',
        border: '2px solid #0A0A0A',
        boxShadow: '4px 4px 0px #0A0A0A',
        borderRadius: 0,
        textDecoration: 'none',
        transition: 'transform 80ms ease-out, box-shadow 80ms ease-out',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translate(-2px, -2px)';
        e.currentTarget.style.boxShadow = '6px 6px 0px #0A0A0A';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translate(0, 0)';
        e.currentTarget.style.boxShadow = '4px 4px 0px #0A0A0A';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'between', gap: '8px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: '#0A0A0A', margin: 0 }} className="truncate flex-1">
          {event.title}
        </h3>
        <RequestStatusBadge status={event.status} />
      </div>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#555555', marginTop: 6 }}>
        {formatDateRange(event.startTime, event.endTime)} · {event.location}
      </p>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#555555', marginTop: 10, lineHeight: 1.5 }} className="line-clamp-2">
        {event.description}
      </p>
      <div style={{ borderTop: '2px solid #0A0A0A', marginTop: 14, paddingTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 11 }}>
        {event.type === "PUBLIC" ? (
          <span style={{ backgroundColor: '#C8F135', border: '1.5px solid #0A0A0A', color: '#0A0A0A', fontFamily: 'DM Sans, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 0 }}>
            Public
          </span>
        ) : (
          <span style={{ backgroundColor: '#0A0A0A', color: '#C8F135', border: '1.5px solid #0A0A0A', fontFamily: 'DM Sans, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 0 }}>
            Club Exclusive
          </span>
        )}
        <span style={{ color: '#0A0A0A' }}>·</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#555555' }}>
          {event.registeredCount}
          {event.capacity !== null ? ` / ${event.capacity}` : ""} registered{isFull ? " · Full" : ""}
        </span>
      </div>
    </Link>
  );
}
