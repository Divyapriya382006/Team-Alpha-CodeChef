const ROLE_STYLES: Record<string, {bg: string, color: string}> = {
  SUPER_ADMIN:         { bg: '#0A0A0A', color: '#C8F135' },
  FACULTY_COORDINATOR: { bg: '#F5A623', color: '#0A0A0A' },
  CLUB_HEAD:           { bg: '#C8F135', color: '#0A0A0A' },
  CLUB_MEMBER:         { bg: '#E8E3DB', color: '#0A0A0A' },
  MEMBER:              { bg: '#E8E3DB', color: '#0A0A0A' },
  STUDENT:             { bg: '#333333', color: '#FFFFFF' },
  DEPARTMENT_HEAD:     { bg: '#F5A623', color: '#0A0A0A' },
};

export function RoleBadge({ role }: { role: string }) {
  const s = ROLE_STYLES[role] ?? { bg: '#E8E3DB', color: '#0A0A0A' };
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      border: '1.5px solid #0A0A0A',
      padding: '2px 8px',
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      borderRadius: 0,
      fontFamily: 'DM Sans, sans-serif',
      display: 'inline-block',
    }}>
      {role.replace(/_/g, ' ')}
    </span>
  );
}
