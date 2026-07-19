const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const medal = MEDALS[rank];
  if (medal) {
    return <span className="flex h-9 w-9 shrink-0 items-center justify-center text-xl">{medal}</span>;
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-sm font-semibold text-slate-400">
      {rank}
    </span>
  );
}
