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

type FilterValue =
  | string
  | boolean
  | number
  | (string | boolean | number)[]
  | undefined;

interface DynamicFiltersProps<T extends Record<string, FilterValue>> {
  configs: FilterConfig[];
  filters: T;
  setFilters: React.Dispatch<React.SetStateAction<T>>;
  onClear?: () => void;
}

export default function DynamicFilters<
  T extends Record<string, FilterValue>
>({
  configs,
  filters,
  setFilters,
  onClear,
}: DynamicFiltersProps<T>) {
  const handleToggle = (
    key: string,
    value: string | boolean,
    multi?: boolean
  ) => {
    setFilters((prev) => {
      const currentValue = prev[key];

      // 🔥 MULTI SELECT
      if (multi) {
        const currentArray = Array.isArray(currentValue)
          ? (currentValue as (string | boolean | number)[])
          : [];

        const exists = currentArray.includes(value);

        const newArray = exists
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value];

        return {
          ...prev,
          [key]: newArray.length ? newArray : undefined,
        };
      }

      // 🔥 SINGLE SELECT
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
                ? value.includes(opt.value)
                : value === opt.value;

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() =>
                    handleToggle(config.key, opt.value, config.multi)
                  }
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all
                    ${
                      isSelected
                        ? "bg-accent text-white"
                        : "border border-border hover:border-accent/50"
                    }
                  `}
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
          type="button"
          onClick={onClear}
          className="ml-auto text-error text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <X size={14} /> Limpar
        </button>
      )}
    </div>
  );
}
