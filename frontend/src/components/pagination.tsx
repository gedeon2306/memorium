"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);
  const pages = getPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-white/40 order-2 sm:order-1">
        Affichage{" "}
        <span className="text-white/55">
          {from}–{to}
        </span>{" "}
        sur <span className="text-white/55">{totalCount}</span> utilisateurs
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-ghost btn-sm px-2 sm:px-3 text-white/50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Page numbers */}
        <div className="join">
          {pages.map((page, idx) =>
            page === "…" ? (
              <button
                key={`ellipsis-${idx}`}
                type="button"
                disabled
                aria-hidden
                className="join-item btn btn-sm btn-ghost btn-disabled border border-white/10 text-white/25 min-w-9"
              >
                …
              </button>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`join-item btn btn-sm min-w-9 ${
                  page === currentPage
                    ? "btn-primary"
                    : "btn-ghost border border-white/10 text-white/70"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-ghost btn-sm gap-1 text-white/70 disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}