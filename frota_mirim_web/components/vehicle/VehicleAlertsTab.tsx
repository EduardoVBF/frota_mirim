"use client";
import {
  getAlerts,
  Alert,
  AlertFilters,
  AlertsResponse,
} from "@/services/alerts.service";
import { Bell, AlertTriangle, ShieldAlert } from "lucide-react";
import AlertsTable from "@/components/alerts/alertsTable";
import { Vehicle } from "@/services/vehicles.service";
import Pagination from "@/components/paginationComp";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import { useEffect, useState } from "react";

type Props = {
  vehicle: Vehicle;
};

export default function VehicleAlertsTab({ vehicle }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<AlertFilters>({
    search: "",
    severity: undefined,
    isRead: undefined,
    resolved: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchAlerts = async () => {
    setLoading(true);

    try {
      const data: AlertsResponse = await getAlerts({
        ...filters,
        vehiclePlate: vehicle.placa,
        page,
        limit,
      });

      setAlerts(data.items);
      setMeta(data.meta);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  if (loading && page === 1) return <LoaderComp />;

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-3 gap-6">
        <StatsCard
          label="Não lidos"
          value={alerts.filter((a) => !a.isRead).length.toString()}
          icon={<Bell />}
          iconColor="text-accent"
        />

        <StatsCard
          label="Avisos"
          value={alerts.filter((a) => a.severity === "WARNING").length.toString()}
          icon={<AlertTriangle />}
          iconColor="text-warning"
        />

        <StatsCard
          label="Críticos"
          value={alerts.filter((a) => a.severity === "CRITICAL").length.toString()}
          icon={<ShieldAlert />}
          iconColor="text-red-500"
        />
      </div>

      <AlertsTable
        alerts={alerts}
        isLoading={loading}
        filters={filters}
        setFilters={setFilters}
        onChange={fetchAlerts}
        isVehiclePage
        vehicle={vehicle}
      />

      <Pagination
        page={page}
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}