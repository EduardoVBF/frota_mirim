"use client";
import { Fuel, ClockCheck, Wrench, TriangleAlert } from "lucide-react";
import VehicleMaintenanceTab from "./VehicleMaintenanceTab";
import { Vehicle } from "@/services/vehicles.service";
import { getAlerts } from "@/services/alerts.service";
import VehicleAlertsTab from "./VehicleAlertsTab";
import VehicleUsageTab from "./VehicleUsageTab";
import VehicleFuelTab from "./VehicleFuelTab";
import { useState, useEffect } from "react";

type Props = {
  vehicle: Vehicle;
};

type VehicleTab = "FUEL" | "USAGE" | "MAINTENANCE" | "ALERTS";

export default function VehicleTabs({ vehicle }: Props) {
  const [activeTab, setActiveTab] = useState<VehicleTab>("FUEL");
  const [alertCount, setAlertCount] = useState(0);

  const TABS = [
    {
      key: "FUEL" as VehicleTab,
      label: "Abastecimentos",
      icon: Fuel,
    },
    {
      key: "USAGE" as VehicleTab,
      label: "Entradas / Saídas",
      icon: ClockCheck,
    },
    {
      key: "MAINTENANCE" as VehicleTab,
      label: "Manutenções",
      icon: Wrench,
    },
    {
      key: "ALERTS" as VehicleTab,
      label: "Alertas",
      icon: TriangleAlert,
      badge: alertCount,
    },
  ];

  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const data = await getAlerts({
          vehiclePlate: vehicle.placa,
          page: 1,
          limit: 10,
          isRead: false,
        });

        setAlertCount(data.meta.totalFiltered || 0);
      } catch {
        setAlertCount(0);
      }
    }

    fetchAlertCount();
  }, [vehicle.placa]);

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-2 transition
                ${
                  activeTab === tab.key
                    ? "border-b-2 border-accent text-accent font-medium"
                    : "text-muted hover:text-foreground"
                }`}
            >
              <Icon size={16} />
              {tab.label}

              {tab.badge && tab.badge > 0 && (
                <span className="flex items-center justify-center min-w-4.5 h-4.5 -mt-4 -ml-1 p-1 text-[10px] rounded-full bg-error text-white animate-pulse">
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "FUEL" && <VehicleFuelTab vehicle={vehicle} />}
      {activeTab === "USAGE" && <VehicleUsageTab vehicle={vehicle} />}
      {activeTab === "MAINTENANCE" && (
        <VehicleMaintenanceTab vehicle={vehicle} />
      )}
      {activeTab === "ALERTS" && <VehicleAlertsTab vehicle={vehicle} />}
    </div>
  );
}
