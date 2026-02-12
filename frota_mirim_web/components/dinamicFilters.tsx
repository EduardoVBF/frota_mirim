"use client";
import { X, Check } from "lucide-react";

export type FilterOption = {
  label: string;
  value: string | boolean;
};

export type FilterConfig = {
  key: string;
  label: string;
  options: FilterOption[];
};

interface DynamicFiltersProps {
  configs: FilterConfig[];
  filters: Record<string, string | boolean | undefined>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, string | boolean | undefined>>
  >;
  onClear?: () => void;
}

export default function DynamicFilters({
  configs,
  filters,
  setFilters,
  onClear,
}: DynamicFiltersProps) {
  
  const handleToggle = (key: string, value: string | boolean) => {
    setFilters((prev) => {
      const isSelected = prev[key] === value;
      return {
        ...prev,
        [key]: isSelected ? undefined : value,
      };
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-border bg-background/50">
      <div className="flex flex-wrap items-center gap-6">
        {configs.map((config) => (
          <div key={config.key} className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted px-1">
              {config.label}
            </span>
            
            <div className="flex items-center gap-1.5">
              {config.options.map((opt) => {
                const isSelected = filters[config.key] === opt.value;
                
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleToggle(config.key, opt.value)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                      flex items-center gap-1.5
                      ${isSelected 
                        ? "bg-accent border-accent text-white shadow-md shadow-accent/20" 
                        : "bg-background border-border text-muted hover:border-accent/50 hover:text-foreground"
                      }
                    `}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {onClear && Object.values(filters).some(v => v !== undefined && v !== "") && (
          <div className="flex flex-col gap-2 self-end">
             <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10 rounded-full transition-colors border border-transparent hover:border-error/20"
            >
              <X size={14} /> Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}