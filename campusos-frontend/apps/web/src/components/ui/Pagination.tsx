import type { Pagination as PaginationData } from "../../types";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center py-8 animate-brute-in">
      <div className="flex items-center -space-x-[2px]">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="btn-secondary rounded-none !px-3 !py-2 text-xs border-2 border-ink bg-white font-bold select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {pages.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={
                isActive
                  ? { backgroundColor: '#0A0A0A', color: '#C8F135', border: '2px solid #0A0A0A' }
                  : { backgroundColor: '#FFFFFF', color: '#0A0A0A', border: '2px solid #0A0A0A' }
              }
              className="h-[34px] w-[34px] flex items-center justify-center text-xs font-bold font-sans transition-all duration-100 select-none"
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#C8F135';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="btn-secondary rounded-none !px-3 !py-2 text-xs border-2 border-ink bg-white font-bold select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
