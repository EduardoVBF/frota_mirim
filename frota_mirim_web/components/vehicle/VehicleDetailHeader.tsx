"use client";
import {
  Edit3,
  AlertTriangle,
  ArrowLeft,
  Fuel,
  Calendar,
  Gauge,
} from "lucide-react";
import {
  updateVehicle,
  UpdateVehiclePayload,
  Vehicle,
  VehiclePayload,
} from "@/services/vehicles.service";
import { translateApiErrors } from "@/utils/translateApiError";
import VehicleFormModal from "./vehicleFormModal";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import utc from "dayjs/plugin/utc";
import { AxiosError } from "axios";
import { useState } from "react";
import dayjs from "dayjs";

type Props = {
  vehicle: Vehicle;
};

dayjs.extend(utc);

export function VehicleDetailHeader({
  vehicle,
  onVehicleChange,
}: Props & { onVehicleChange: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const today = new Date();
  const docExpired = new Date(vehicle.vencimentoDocumento) < today;
  const ipvaExpired = new Date(vehicle.vencimentoIPVA) < today;

  const alertCount = (docExpired ? 1 : 0) + (ipvaExpired ? 1 : 0);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: VehiclePayload) => {
    setLoading(true);
    try {
      await updateVehicle(vehicle.id, data as UpdateVehiclePayload);
      toast.success("Veículo atualizado");

      setIsModalOpen(false);
      await onVehicleChange();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar o veículo");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao salvar o veículo");
          return;
        }
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar o veículo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />

      <VehicleFormModal
        key={vehicle.id}
        open={isModalOpen}
        onSubmit={handleFormSubmit}
        loading={loading}
        initialData={vehicle}
        onClose={() => {
          setIsModalOpen(false);
          setLoading(false);
        }}
        errors={errors}
      />

      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para frota
          </button>

          <div className="flex items-center gap-3">
            {alertCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-full text-xs font-bold">
                <AlertTriangle size={14} /> {alertCount} alerta(s)
              </div>
            )}

            <button
              className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition-all"
              onClick={() => handleEdit()}
            >
              <Edit3 size={18} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            {vehicle.modelo} -{" "}
            <span className="text-accent">{vehicle.placa}</span>
          </h1>
          <p className="text-muted font-medium">
            {vehicle.marca}, {vehicle.ano} •{" "}
            <span className={vehicle.isActive ? "text-success" : "text-error"}>
              {vehicle.isActive ? "Em operação" : "Inativo"}
            </span>
          </p>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TelemetriaCard
            icon={<Gauge />}
            label="Quilometragem"
            value={`${vehicle.kmAtual.toLocaleString()} km`}
          />

          <TelemetriaCard
            icon={<Calendar />}
            label="Documento"
            value={dayjs.utc(vehicle.vencimentoDocumento).format("DD/MM/YYYY")}
            highlight={docExpired}
          />

          <TelemetriaCard
            icon={<Calendar />}
            label="IPVA"
            value={dayjs.utc(vehicle.vencimentoIPVA).format("DD/MM/YYYY")}
            highlight={ipvaExpired}
          />

          <TelemetriaCard
            icon={<Fuel />}
            label="Último Abastecimento"
            value={
              vehicle.kmUltimoAbastecimento
                ? `${vehicle.kmUltimoAbastecimento.toLocaleString()} km`
                : "—"
            }
          />
        </div>
      </div>
    </>
  );
}

type TelemetriaCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
};

function TelemetriaCard({
  icon,
  label,
  value,
  highlight = false,
}: TelemetriaCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        highlight
          ? "bg-error border-error/40 text-white shadow-lg shadow-error/20"
          : "bg-alternative-bg border-border"
      }`}
    >
      <div
        className={`flex items-center gap-2 mb-2 ${
          highlight ? "text-white/70" : "text-muted"
        }`}
      >
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>

      <div
        className={`text-xl font-bold ${
          highlight ? "text-white" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
