"use client";
import {
  getMaintenanceById,
  Maintenance,
  MaintenanceStatus,
} from "@/services/maintenance.service";
import {
  Wrench,
  DollarSign,
  Gauge,
  Car,
  Calendar,
  Edit3,
  ClipboardList,
  Pencil,
  Activity,
} from "lucide-react";
import { MaintenanceItemsTable } from "@/components/maintenance/maintenanceItemsTable";
import MaintenanceStatusModal from "@/components/maintenance/MaintenanceStatusModal";
import MaintenanceFormModal from "@/components/maintenance/maintenanceFormModal";
import { useEffect, useState, useCallback } from "react";
import { FadeIn } from "@/components/motion/fadeIn";
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
  const [statusModalOpen, setStatusModalOpen] = useState(false);

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

      <MaintenanceStatusModal
        open={statusModalOpen}
        maintenanceId={maintenance.id}
        currentStatus={maintenance.status}
        onClose={() => setStatusModalOpen(false)}
        onSuccess={fetchMaintenance}
      />

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
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <Wrench size={26} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Manutenção</h1>
                {handleStatusBadge(maintenance.status)}
              </div>

              <p className="text-muted text-sm">
                #{maintenance.sequenceId.toString().padStart(5, "0")}
              </p>
            </div>
          </div>

          <button
            className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Edit3 size={18} />
          </button>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_5fr] gap-6">
          {/* LEFT - INFO */}
          <div className="flex flex-col justify-between space-y-4">
            {/* STATUS */}
            <div className="rounded-2xl border border-border bg-alternative-bg p-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                  <Activity size={16} className="text-accent" />
                  Status
                </div>

                {handleStatusBadge(maintenance.status)}
              </div>

              <button
                onClick={() => setStatusModalOpen(true)}
                className="p-2 hover:text-accent cursor-pointer"
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* CUSTOS */}
            <div className="rounded-2xl border border-border bg-alternative-bg p-6 space-y-4 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                <DollarSign size={16} className="text-accent" />
                Custos da manutenção
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Peças</span>
                  <span className="font-semibold">
                    {formatMoney(maintenance.partsCost || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted">Serviços</span>
                  <span className="font-semibold">
                    {formatMoney(maintenance.servicesCost || 0)}
                  </span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-accent">
                    {formatMoney(maintenance.totalCost || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - SIDEBAR */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-alternative-bg p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                <ClipboardList size={16} className="text-accent" />
                Informações da manutenção
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* VEÍCULO */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Car size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-muted uppercase">Veículo</p>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">
                        {maintenance.vehicle.modelo}
                      </p>
                      <p>-</p>
                      <p className="text-muted">{maintenance.vehicle.placa}</p>
                    </div>
                  </div>
                </div>

                {/* KM */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <Gauge size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-muted uppercase">
                      Quilometragem
                    </p>
                    <p className="font-semibold">{maintenance.odometer} km</p>
                  </div>
                </div>

                {/* DATA */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Calendar size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-muted uppercase">Data</p>
                    <p className="font-semibold">
                      {dayjs(maintenance.createdAt).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>

                {/* TIPO */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning">
                    <Wrench size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-muted uppercase">Tipo</p>
                    <p className="font-semibold">
                      {maintenance.type === "PREVENTIVE"
                        ? "Preventiva"
                        : "Corretiva"}
                    </p>
                  </div>
                </div>
              </div>

              {/* DESCRIÇÃO */}
              {maintenance.description && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted uppercase mb-2">Descrição</p>

                  <p className="text-sm leading-relaxed text-muted bg-background border border-border rounded-xl p-4">
                    {maintenance.description}
                  </p>
                </div>
              )}
            </div>
          </div>
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
