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
    <div className="flex flex-wrap gap-6 p-4 border-b border-border">
      {configs.map((config) => (
        <div key={config.key}>
          <span className="text-xs font-bold">{config.label}</span>
          <div className="flex gap-2 mt-2">
            {config.options.map((opt) => {
              const isSelected = filters[config.key] === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => handleToggle(config.key, opt.value)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                    isSelected ? "bg-accent text-white" : "border"
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {onClear && (
        <button
          onClick={onClear}
          className="ml-auto text-error text-xs flex items-center gap-1"
        >
          <X size={14} /> Limpar
        </button>
      )}
    </div>
  );
}
