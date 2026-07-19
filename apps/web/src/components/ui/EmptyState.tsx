interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed border-ink bg-white px-6 py-14 text-center rounded-none shadow-brutal animate-brute-in">
      <div className="font-display font-extrabold text-4xl text-ink mb-3 select-none">
        ∅
      </div>
      <p className="font-display font-bold text-base text-ink">{title}</p>
      {description && <p style={{ color: '#555555' }} className="mt-1 text-sm">{description}</p>}
    </div>
  );
}
