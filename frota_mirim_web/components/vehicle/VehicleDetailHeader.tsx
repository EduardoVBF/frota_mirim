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
import { AxiosError } from "axios";
import { useState } from "react";
import dayjs from "dayjs";

type Props = {
  vehicle: Vehicle;
};

export function VehicleDetailHeader({
  vehicle,
  onVehicleChange,
}: Props & { onVehicleChange: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const currentMonth = dayjs().month() + 1;

  const docExpired = currentMonth >= vehicle.licensingDueMonth;
  const ipvaExpired = currentMonth >= vehicle.ipvaDueMonth;

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
      }

      if (!err.response || !err.response.data) {
        toast.error("Erro ao salvar o veículo");
        return;
      }

      const { fieldErrors, toastMessage } = translateApiErrors(
        err.response.data,
      );

      setErrors(fieldErrors);
      toast.error(toastMessage || "Erro ao salvar o veículo");
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month: number) => {
    switch (month) {
      case 1:
        return "Janeiro";
      case 2:
        return "Fevereiro";
      case 3:
        return "Março";
      case 4:
        return "Abril";
      case 5:
        return "Maio";
      case 6:
        return "Junho";
      case 7:
        return "Julho";
      case 8:
        return "Agosto";
      case 9:
        return "Setembro";
      case 10:
        return "Outubro";
      case 11:
        return "Novembro";
      case 12:
        return "Dezembro";
      default:
        return "—";
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

          <button
            className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition-all"
            onClick={handleEdit}
          >
            <Edit3 size={18} />
          </button>
        </div>

        {/* Title */}
        <div>
          {alertCount > 0 && (
            <div className="w-fit  flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-full text-xs font-bold">
              <AlertTriangle size={14} /> {alertCount} alerta(s)
            </div>
          )}
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
            value={`${formatMonth(vehicle.licensingDueMonth)} ${dayjs().year()}`}
            highlight={docExpired}
          />

          <TelemetriaCard
            icon={<Calendar />}
            label="IPVA"
            value={`${formatMonth(vehicle.ipvaDueMonth)} ${dayjs().year()}`}
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
