"use client";
import React from "react";

export default function DashboardCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div
      className="
      rounded-2xl border border-border bg-linear-to-br from-alternative-bg to-background p-3 flex gap-4 items-center hover:shadow-md hover:scale-[1.01] transition-all duration-200"
    >
      <div className="p-3 rounded-xl bg-accent/10 text-accent shadow-inner">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-[11px] text-muted uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold mt-1">{value ?? "-"}</p>
      </div>
    </div>
  );
}
