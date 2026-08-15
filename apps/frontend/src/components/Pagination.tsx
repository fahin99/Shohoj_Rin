import { IconButton } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const start = totalItems && pageSize ? (page - 1) * pageSize + 1 : null;
  const end = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {totalItems && start && end ? (
        <p className="text-xs text-stone-500 tabular-nums">
          {start}–{end} of {totalItems}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <IconButton
          label="Previous"
          size="sm"
          variant="ghost"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-stone-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-[4px] transition-colors ${
                page === p
                  ? 'bg-navy text-white border border-navy'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-navy'
              }`}
            >
              {p}
            </button>
          )
        )}
        <IconButton
          label="Next"
          size="sm"
          variant="ghost"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
