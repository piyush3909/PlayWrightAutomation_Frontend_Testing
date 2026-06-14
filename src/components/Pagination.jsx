import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  // Keep pagination stable even when a filter returns zero results.
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>
        Showing <span className="font-semibold">{firstItem}</span> to{' '}
        <span className="font-semibold">{lastItem}</span> of{' '}
        <span className="font-semibold">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <PageButton label="First page" disabled={page === 1} onClick={() => onPageChange(1)}>
            <ChevronsLeft className="h-4 w-4" />
          </PageButton>
          <PageButton label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </PageButton>
          <span className="min-w-20 text-center font-semibold text-slate-950">
            {page} / {totalPages}
          </span>
          <PageButton label="Next page" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </PageButton>
          <PageButton label="Last page" disabled={page === totalPages} onClick={() => onPageChange(totalPages)}>
            <ChevronsRight className="h-4 w-4" />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

function PageButton({ children, disabled, label, onClick }) {
  // Icon-only buttons use aria-label/title so they remain accessible and testable.
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
