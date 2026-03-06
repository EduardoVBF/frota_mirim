"use client";
import {
  getMaintenanceById,
  Maintenance,
} from "@/services/maintenance.service";
import { MaintenanceItemsTable } from "@/components/maintenance/maintenanceItemsTable";
import { Wrench, Package, DollarSign } from "lucide-react";
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
        <div className="rounded-2xl border border-border bg-alternative-bg p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted">Veículo</p>
              <p className="font-bold">
                {maintenance.vehicle.modelo} - {maintenance.vehicle.placa}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Data</p>
              <p className="font-bold">
                {maintenance.createdAt
                  ? dayjs(maintenance.createdAt).format("DD/MM/YYYY")
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Tipo</p>
              <p className="font-bold">
                {maintenance.type === "PREVENTIVE" ? "Preventiva" : "Corretiva"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Status</p>
              <p className="font-bold">{maintenance.status}</p>
            </div>

            <div>
              <p className="text-xs text-muted">KM</p>
              <p className="font-bold">{maintenance.odometer} km</p>
            </div>
          </div>

          {maintenance.description && (
            <div>
              <p className="text-xs text-muted">Descrição</p>
              <p>{maintenance.description}</p>
            </div>
          )}
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
