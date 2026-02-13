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
  multi?: boolean;
};

interface DynamicFiltersProps {
  configs: FilterConfig[];
  filters: Record<string, string | boolean | string[] | undefined>;
  setFilters: React.Dispatch<
    React.SetStateAction<
      Record<string, string | boolean | string[] | undefined>
    >
  >;
  onClear?: () => void;
}

export default function DynamicFilters({
  configs,
  filters,
  setFilters,
  onClear,
}: DynamicFiltersProps) {
  const handleToggle = (
    key: string,
    value: string | boolean,
    multi?: boolean,
  ) => {
    setFilters((prev) => {
      const currentValue = prev[key];

      // 🔥 MULTI SELECT
      if (multi) {
        const currentArray = Array.isArray(currentValue) ? currentValue : [];

        const exists = currentArray.includes(value as string);

        const newArray = exists
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value as string];

        return {
          ...prev,
          [key]: newArray.length ? newArray : undefined,
        };
      }

      const isSelected = currentValue === value;

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
              const value = filters[config.key];

              const isSelected = Array.isArray(value)
                ? value.includes(opt.value as string)
                : value === opt.value;

              return (
                <button
                  key={String(opt.value)}
                  onClick={() =>
                    handleToggle(config.key, opt.value, config.multi)
                  }
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
