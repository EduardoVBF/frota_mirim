"use client";
import PrimarySelect from "../form/primarySelect";

type LimitSelectProps = {
  value: number;
  onChange: (value: number | string) => void;
  options?: number[];
};

export default function LimitSelect({
  value,
  onChange,
  options = [5, 10, 20, 50],
}: LimitSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-gray-500">Itens por página</p>

      <PrimarySelect
        label=""
        value={value.toString()}
        onChange={(val) => onChange(Number(val))}
        options={options.map((option) => ({
            label: option.toString(),
            value: option.toString(),
        }))}
      />
    </div>
  );
}