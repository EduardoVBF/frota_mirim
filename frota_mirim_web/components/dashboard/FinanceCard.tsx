"use client";
import React from "react";

export default function FinanceCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number | undefined;
}) {
  return (
    <div className="rounded-2xl border border-border bg-linear-to-br from-alternative-bg to-background p-4 hover:shadow-md transition">
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <div className="p-2 bg-accent/10 rounded-lg text-accent">
          <Icon size={16} />
        </div>
        {title}
      </div>

      <p className="text-3xl font-semibold tracking-tight">{value ?? "-"}</p>
    </div>
  );
}
