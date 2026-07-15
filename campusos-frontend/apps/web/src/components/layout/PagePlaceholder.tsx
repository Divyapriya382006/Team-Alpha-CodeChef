interface PagePlaceholderProps {
  title: string;
  description?: string;
}

// Stand-in for pages not yet built, so AppRoutes.tsx can wire every real route today.
// Replace one route at a time with its real page component as each module gets built.
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="surface mx-auto inline-flex flex-col items-center gap-2 px-8 py-10">
        <span className="eyebrow">Coming soon</span>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-slate-500">{description ?? "This page is not built yet."}</p>
      </div>
    </div>
  );
}
