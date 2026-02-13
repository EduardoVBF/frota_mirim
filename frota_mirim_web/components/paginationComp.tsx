"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-4 mt-6 ${className}`}>
      {/* Botão anterior */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`
          w-10 h-10 flex items-center justify-center
          rounded-xl border border-border transition-all duration-200
          ${
            page === 1
              ? "opacity-30 cursor-not-allowed"
              : "bg-alternative-bg hover:border-accent hover:text-accent active:scale-95"
          }
        `}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Indicador central */}
      <div
        className="
          px-6 py-2 rounded-2xl
          bg-alternative-bg border border-border
          text-sm font-bold tracking-wide
          shadow-sm
        "
      >
        <span className="text-accent">{page}</span>{" "}
        <span className="text-muted">de</span>{" "}
        <span className="text-foreground">{totalPages}</span>
      </div>

      {/* Botão próximo */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`
          w-10 h-10 flex items-center justify-center
          rounded-xl border border-border transition-all duration-200
          ${
            page === totalPages
              ? "opacity-30 cursor-not-allowed"
              : "bg-alternative-bg hover:border-accent hover:text-accent active:scale-95"
          }
        `}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
