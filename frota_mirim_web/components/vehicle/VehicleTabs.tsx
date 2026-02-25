"use client";
import { useState } from "react";
import { Vehicle } from "@/services/vehicles.service";
import VehicleFuelTab from "./VehicleFuelTab";
import VehicleUsageTab from "./VehicleUsageTab";

type Props = {
  vehicle: Vehicle;
};

export default function VehicleTabs({ vehicle }: Props) {
  const [activeTab, setActiveTab] = useState<"fuel" | "usage">("fuel");

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("fuel")}
          className={`pb-2 transition ${
            activeTab === "fuel"
              ? "border-b-2 border-accent text-accent font-medium"
              : "text-muted hover:text-foreground"
          }`}
        >
          Abastecimentos
        </button>

        <button
          onClick={() => setActiveTab("usage")}
          className={`pb-2 transition ${
            activeTab === "usage"
              ? "border-b-2 border-accent text-accent font-medium"
              : "text-muted hover:text-foreground"
          }`}
        >
          Entradas / Saídas
        </button>
      </div>

      {activeTab === "fuel" && <VehicleFuelTab vehicle={vehicle} />}
      {activeTab === "usage" && <VehicleUsageTab vehicle={vehicle} />}
    </div>
  );
}