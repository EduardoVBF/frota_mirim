"use client";
import { Fuel } from "lucide-react";
import { SkeletonRow } from "./Skeleton";

type FuelItem = {
  vehicle: string;
  kmPerLiter?: number;
};

export default function InsightCardFuel({
  title,
  fuelEfficiency,
  loading,
}: {
  title: string;
  loading: boolean;
  fuelEfficiency?: {
    average: number;
    best: FuelItem;
    worst: FuelItem;
  };
}) {
  const hasData = fuelEfficiency?.best || fuelEfficiency?.worst;

  return (
    <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel size={20} className="text-accent" />
          <h2 className="font-semibold text-muted">{title}</h2>
        </div>
        <span className="text-xs text-muted">km/l</span>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : !hasData ? (
          <div className="text-sm text-muted text-center py-6">
            Nenhum dado disponível
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* MELHOR */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                ↑ Melhor eficiência
              </span>

              {fuelEfficiency.best && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {fuelEfficiency.best.vehicle}
                    </span>
                  </div>

                  <span className="font-semibold text-green-500">
                    {fuelEfficiency.best.kmPerLiter?.toFixed(1)} km/l
                  </span>
                </div>
              )}
            </div>

            {/* PIOR */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                ↓ Pior eficiência
              </span>

              {fuelEfficiency.worst && (
                <div
                  key={fuelEfficiency.worst.vehicle}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {fuelEfficiency.worst.vehicle}
                    </span>
                  </div>

                  <span className="font-semibold text-red-500">
                    {fuelEfficiency.worst.kmPerLiter?.toFixed(1)} km/l
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
