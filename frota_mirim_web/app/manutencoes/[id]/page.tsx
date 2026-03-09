"use client";
import {
  getMaintenanceById,
  Maintenance,
  MaintenanceStatus,
} from "@/services/maintenance.service";
import {
  Wrench,
  Package,
  DollarSign,
  Gauge,
  Car,
  Calendar,
  Edit3,
} from "lucide-react";
import { MaintenanceItemsTable } from "@/components/maintenance/maintenanceItemsTable";
import MaintenanceFormModal from "@/components/maintenance/maintenanceFormModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const formatMoney = (value: string | number) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full font-medium">
            Aberta
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="text-xs bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full font-medium">
            Em andamento
          </span>
        );
      case "DONE":
        return (
          <span className="text-xs bg-green-500/20 text-green-500 px-3 py-1 rounded-full font-medium">
            Concluída
          </span>
        );
      case "CANCELED":
        return (
          <span className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-full font-medium">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="text-xs bg-gray-500/20 text-gray-500 px-3 py-1 rounded-full">
            Desconhecido
          </span>
        );
    }
  };

  if (loading || !maintenance) {
    return <LoaderComp />;
  }

  return (
    <FadeIn>
      <Toaster />

      <MaintenanceFormModal
        open={isModalOpen}
        maintenance={maintenance}
        onClose={() => {
          setIsModalOpen(false);
          fetchMaintenance();
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <Wrench size={26} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Manutenção</h1>
                <div>{handleStatusBadge(maintenance.status)}</div>
              </div>

              <p className="text-muted text-sm">#{maintenance.id}</p>
            </div>
          </div>

          <button
            className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition-all cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Edit3 size={18} />
          </button>
        </header>

        {/* CUSTOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            label="Peças"
            value={formatMoney(maintenance.partsCost || 0)}
            icon={<Package />}
            iconColor="text-warning"
          />

          <StatsCard
            label="Serviços"
            value={formatMoney(maintenance.servicesCost || 0)}
            icon={<Wrench />}
            iconColor="text-accent"
          />

          <StatsCard
            label="Total"
            value={formatMoney(maintenance.totalCost || 0)}
            icon={<DollarSign />}
            iconColor="text-success"
          />
        </div>

        {/* INFORMAÇÕES */}
        <div className="rounded-2xl border border-border bg-alternative-bg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* VEÍCULO */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/20 transition">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Car size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Veículo
                </p>

                <p className="font-semibold">{maintenance.vehicle.modelo}</p>

                <p className="text-xs text-muted">
                  {maintenance.vehicle.placa}
                </p>
              </div>
            </div>

            {/* TIPO */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/20 transition">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Wrench size={18} />
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  Tipo
                </p>

                <p className="font-semibold">
                  {maintenance.type === "PREVENTIVE"
                    ? "Preventiva"
                    : "Corretiva"}
                </p>
              </div>
            </div>

            {/* DATA */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/20 transition">
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

            {/* KM */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/20 transition">
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
          </div>

          {/* DESCRIÇÃO */}
          {maintenance.description && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted uppercase tracking-wide mb-2">
                Descrição
              </p>

              <p className="text-sm leading-relaxed text-muted bg-background border border-border rounded-xl p-4">
                {maintenance.description}
              </p>
            </div>
          )}
        </div>

        {/* ITENS */}
        <MaintenanceItemsTable
          maintenance={maintenance}
          onUpdate={fetchMaintenance}
        />
      </div>
    </FadeIn>
  );
}
