"use client";
import {
  getMaintenanceById,
  Maintenance,
  MaintenanceStatus,
} from "@/services/maintenance.service";
import { MaintenanceItemsTable } from "@/components/maintenance/maintenanceItemsTable";
import {
  Wrench,
  Package,
  DollarSign,
  Gauge,
  Car,
  Calendar,
  ChartCandlestick,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "next/navigation";
import dayjs from "dayjs";

export default function MaintenanceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);

  const fetchMaintenance = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getMaintenanceById(id);
      setMaintenance(data);
    } catch {
      toast.error("Erro ao carregar manutenção");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
            Aberta
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full">
            Em andamento
          </span>
        );
      case "DONE":
        return (
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
            Concluída
          </span>
        );
      case "CANCELED":
        return (
          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full">
            Desconecido
          </span>
        );
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  if (loading || !maintenance) {
    return <LoaderComp />;
  }
  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Manutenção #{maintenance.id}</h1>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-6">
          <StatsCard
            label="Peças"
            value={`R$ ${maintenance.partsCost || 0}`}
            icon={<Package />}
            iconColor="text-warning"
          />

          <StatsCard
            label="Serviços"
            value={`R$ ${maintenance.servicesCost || 0}`}
            icon={<Wrench />}
            iconColor="text-accent"
          />

          <StatsCard
            label="Total"
            value={`R$ ${maintenance.totalCost || 0}`}
            icon={<DollarSign />}
            iconColor="text-success"
          />
        </div>

        {/* INFO */}
        <div className="rounded-2xl border border-border bg-alternative-bg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* VEICULO */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Car size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Veículo
                </p>

                <div className="flex items-center gap-1">
                  <p className="font-semibold">{maintenance.vehicle.modelo}</p>
                  <p>-</p>
                  <p className="text-muted">{maintenance.vehicle.placa}</p>
                </div>
              </div>
            </div>

            {/* DATA */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Calendar size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Data
                </p>

                <p className="font-semibold">
                  {maintenance.createdAt
                    ? dayjs(maintenance.createdAt).format("DD/MM/YYYY")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* TIPO */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Wrench size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Tipo
                </p>

                <span className="text-sm font-semibold">
                  {maintenance.type === "PREVENTIVE"
                    ? "Preventiva"
                    : "Corretiva"}
                </span>
              </div>
            </div>

            {/* KM */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Gauge size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Quilometragem
                </p>

                <p className="font-semibold">{maintenance.odometer} km</p>
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <ChartCandlestick size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Status
                </p>

                <p className="font-semibold">{handleStatusBadge(maintenance.status)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center border-t border-border pt-4">
            {/* DESCRIÇÃO */}
            {maintenance.description && (
              <div className="">
                <p className="text-xs text-muted uppercase tracking-wide mb-2">
                  Descrição
                </p>

                <p className="text-sm leading-relaxed text-muted">
                  {maintenance.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ITEMS */}
        <MaintenanceItemsTable
          maintenance={maintenance}
          onUpdate={fetchMaintenance}
        />
      </div>
    </FadeIn>
  );
}
