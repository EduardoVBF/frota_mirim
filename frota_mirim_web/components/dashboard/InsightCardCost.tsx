"use client";
import { InsightItem } from "@/services/dashboard.service";
import { DollarSign } from "lucide-react";
import { SkeletonRow } from "./Skeleton";

export default function InsightCardCost({
  title,
  data,
  loading,
}: {
  title: string;
  data: InsightItem[] | undefined;
  loading: boolean;
}) {
  function formatMoney(value?: number) {
    if (!value) return "-";

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-accent" />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <span className="text-xs text-muted">Top 3</span>
      </div>

      {/* CONTENT */}
      <div className="divide-y divide-border">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          : data?.map((item, i) => (
              <div
                key={item.vehicle}
                className="flex items-center justify-between px-4 py-4 hover:bg-muted/30 transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  {/* RANK */}
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold bg-accent/10 text-accent`}
                  >
                    {i + 1}
                  </div>

                  {/* INFO */}
                  <div className="flex flex-col">
                    <span className="text-sm">{item.vehicle}</span>
                    <span className="text-xs text-muted">Custo acumulado</span>
                  </div>
                </div>

                {/* VALUE */}
                <div className="text-right">
                  <span className="font-semibold text-muted">
                    {formatMoney(item.value)}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
