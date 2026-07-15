import type { Pagination as PaginationData } from "../../types";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="btn-secondary !px-3 !py-1.5 text-xs">
        Previous
      </button>
      <span className="font-mono text-xs text-slate-500">
        {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary !px-3 !py-1.5 text-xs"
      >
        Next
      </button>
    </div>
  );
}
