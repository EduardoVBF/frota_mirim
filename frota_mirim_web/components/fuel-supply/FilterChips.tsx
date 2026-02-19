"use client";

type Option = {
  label: string;
  value: string | boolean;
};

type Props = {
  label?: string;
  options: Option[];
  value?: string | boolean | (string | boolean)[];
  multi?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
};

export default function FilterChips({
  label,
  options,
  value,
  multi = false,
  onChange,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSelected = (val: any) => {
    if (multi && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (val: any) => {
    if (multi) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(val)) {
        onChange(current.filter((v) => v !== val));
      } else {
        onChange([...current, val]);
      }
    } else {
      onChange(value === val ? undefined : val);
    }
  };

  return (
    <div className="space-y-2 px-4">
      {label && (
        <span className="text-xs uppercase tracking-widest text-muted font-bold">
          {label}
        </span>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => handleClick(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
              ${
                isSelected(opt.value)
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-background text-muted border-border hover:border-accent/40"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
