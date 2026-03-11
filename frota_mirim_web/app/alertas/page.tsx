"use client";
import { getAlerts, markAllAlertsRead, Alert } from "@/services/alerts.service";
import { Bell, CheckCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import AlertsTable from "@/components/alerts/alertsTable";
import { useEffect, useState, useCallback } from "react";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAlerts({
        limit: 100,
      });

      setAlerts(data.items);
    } catch {
      toast.error("Erro ao carregar alertas");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleReadAll() {
    try {
      await markAllAlertsRead();
      toast.success("Alertas marcados como lidos");
      fetchAlerts();
    } catch {
      toast.error("Erro ao marcar alertas");
    }
  }

  const unread = alerts.filter((a) => !a.isRead).length;
  const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
  const high = alerts.filter((a) => a.severity === "WARNING").length;

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <Bell size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Central de <span className="text-accent">Alertas</span>
              </h1>

              <p className="text-sm text-muted">
                Monitoramento automático do sistema
              </p>
            </div>
          </div>

          <button
            onClick={handleReadAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold"
          >
            <CheckCheck size={16} />
            Marcar todos como lidos
          </button>
        </header>

        {/* STATS */}
        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Alertas não lidos"
              value={unread.toString()}
              icon={<Bell />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Alertas críticos"
              value={critical.toString()}
              icon={<ShieldAlert />}
              iconColor="text-red-500"
            />

            <StatsCard
              label="Alta prioridade"
              value={high.toString()}
              icon={<AlertTriangle />}
              iconColor="text-warning"
            />
          </div>
        )}

        <AlertsTable alerts={alerts} onChange={fetchAlerts} />
      </div>
    </FadeIn>
  );
}