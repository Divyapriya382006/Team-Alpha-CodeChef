export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, #E8E3DB 25%, #D4CFC6 50%, #E8E3DB 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1s linear infinite',
        border: '2px solid #0A0A0A',
        borderRadius: 0,
      }}
    />
  );
}
