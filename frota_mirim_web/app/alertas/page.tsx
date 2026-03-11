"use client";

import {
  getAlerts,
  Alert,
  AlertFilters,
  AlertsResponse,
} from "@/services/alerts.service";

import AlertsTable from "@/components/alerts/alertsTable";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import Pagination from "@/components/paginationComp";
import LoaderComp from "@/components/loaderComp";

import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

import { Bell, AlertTriangle, ShieldAlert } from "lucide-react";
import { AxiosError } from "axios";

export default function AlertsPage() {
  const [loading, setLoading] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    unread: 0,
    warning: 0,
    critical: 0,
  });

  const [filters, setFilters] = useState<AlertFilters>({
    search: "",
    severity: undefined,
    isRead: undefined,
    resolved: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchAlerts = useCallback(async () => {
    setLoading(true);

    try {
      const data: AlertsResponse = await getAlerts({
        ...filters,
        page,
        limit,
      });

      setAlerts(data.items);
      setMeta(data.meta);
      setStats(data.stats);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao carregar alertas");
        return;
      }

      toast.error("Erro ao carregar alertas");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Central de <span className="text-accent">Alertas</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Não lidos"
              value={stats.unread.toString()}
              icon={<Bell />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Avisos"
              value={stats.warning.toString()}
              icon={<AlertTriangle />}
              iconColor="text-warning"
            />

            <StatsCard
              label="Críticos"
              value={stats.critical.toString()}
              icon={<ShieldAlert />}
              iconColor="text-red-500"
            />
          </div>
        )}

        <AlertsTable
          alerts={alerts}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onChange={fetchAlerts}
        />

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}