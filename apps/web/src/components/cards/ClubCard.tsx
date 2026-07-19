import { Link } from "react-router-dom";
import { Skeleton } from "../ui/Skeleton";
import type { Club } from "../../types";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link
      to={`/clubs/${club.id}`}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {club.logoUrl ? (
          <img
            src={club.logoUrl}
            alt=""
            style={{
              width: 44,
              height: 44,
              border: '2px solid #0A0A0A',
              flexShrink: 0,
              borderRadius: 0,
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              backgroundColor: '#C8F135',
              border: '2px solid #0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: 18,
              color: '#0A0A0A',
              flexShrink: 0,
              borderRadius: 0,
            }}
          >
            {club.name.charAt(0)}
          </div>
        )}
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: '#0A0A0A', margin: '0' }} className="truncate">
          {club.name}
        </h3>
      </div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#555555', marginTop: 8, lineHeight: 1.5 }} className="line-clamp-2">
        {club.description}
      </p>
    </Link>
  );
}

export function ClubCardSkeleton() {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        border: '2px solid #0A0A0A',
        boxShadow: '4px 4px 0px #0A0A0A',
        borderRadius: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton className="h-11 w-11 shrink-0" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}
