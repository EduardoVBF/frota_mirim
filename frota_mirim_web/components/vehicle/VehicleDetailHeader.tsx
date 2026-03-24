"use client";
import {
  Edit3,
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
  payVehicleDocument,
} from "@/services/vehicles.service";
import { translateApiErrors } from "@/utils/translateApiError";
import VehicleFormModal from "./vehicleFormModal";
import toast, { Toaster } from "react-hot-toast";
import { BanknoteArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useState } from "react";
import dayjs from "dayjs";

type Props = {
  vehicle: Vehicle;
};

function formatMonth(month: number) {
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
}

function getDocumentStatus({
  dueMonth,
  paidYear,
}: {
  dueMonth: number;
  paidYear?: number | null;
}) {
  const now = dayjs();
  const currentYear = now.year();

  if (paidYear === currentYear) {
    return {
      status: "PAID" as const,
      label: "Pago",
    };
  }

  const dueDate = dayjs(new Date(currentYear, dueMonth - 1, 1));
  const days = dueDate.diff(now, "day");

  if (days <= 0) {
    return {
      status: "EXPIRED" as const,
      label: "Vencido",
    };
  }

  if (days <= 30) {
    return {
      status: "EXPIRING" as const,
      label: `Vence em ${days} dias`,
    };
  }

  return {
    status: "OK" as const,
    label: `${formatMonth(dueMonth)} ${currentYear}`,
  };
}

export function VehicleDetailHeader({
  vehicle,
  onVehicleChange,
}: Props & { onVehicleChange: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payingDoc, setPayingDoc] = useState<"IPVA" | "LICENSING" | null>(null);

  const router = useRouter();

  const docStatus = getDocumentStatus({
    dueMonth: vehicle.licensingDueMonth,
    paidYear: vehicle.licensingPaidYear,
  });

  const ipvaStatus = getDocumentStatus({
    dueMonth: vehicle.ipvaDueMonth,
    paidYear: vehicle.ipvaPaidYear,
  });

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

  async function handlePayDocument(type: "IPVA" | "LICENSING") {
    try {
      setPayingDoc(type);

      await payVehicleDocument(vehicle.id, type);

      toast.success(
        type === "IPVA"
          ? "IPVA marcado como pago"
          : "Licenciamento marcado como pago",
      );

      await onVehicleChange();
    } catch {
      toast.error("Erro ao marcar documento como pago");
    } finally {
      setPayingDoc(null);
    }
  }

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
            className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition-all cursor-pointer"
            onClick={handleEdit}
          >
            <Edit3 size={18} />
          </button>
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
              {vehicle.isActive ? "Ativo" : "Inativo"}
            </span>{" "}
            •{" "}
            <span>
              {vehicle.status === "AVAILABLE"
                ? "Disponível"
                : vehicle.status === "IN_USE"
                  ? "Em uso"
                  : vehicle.status === "UNDER_MAINTENANCE"
                    ? "Indisponível por manutenção"
                    : vehicle.status === "UNAVAILABLE"
                      ? "Indisponível"
                      : "Desconhecido"}
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
            expireDate={`${formatMonth(vehicle.licensingDueMonth)} ${new Date().getFullYear()}`}
            value={docStatus.label}
            status={docStatus.status}
            action={
              docStatus.status !== "PAID" && (
                <button
                  onClick={() => handlePayDocument("LICENSING")}
                  className="text-xs font-bold text-foreground hover:text-accent hover:underline cursor-pointer"
                  disabled={payingDoc === "LICENSING"}
                  title="Marcar pago"
                >
                  {payingDoc === "LICENSING" ? (
                    "..."
                  ) : (
                    <BanknoteArrowUp size={20} />
                  )}
                </button>
              )
            }
          />

          <TelemetriaCard
            icon={<Calendar />}
            label="IPVA"
            expireDate={`${formatMonth(vehicle.ipvaDueMonth)} ${new Date().getFullYear()}`}
            value={ipvaStatus.label}
            status={ipvaStatus.status}
            action={
              ipvaStatus.status !== "PAID" && (
                <button
                  onClick={() => handlePayDocument("IPVA")}
                  className="text-xs font-bold text-foreground hover:text-accent hover:underline cursor-pointer"
                  disabled={payingDoc === "IPVA"}
                  title="Marcar pago"
                >
                  {payingDoc === "IPVA" ? "..." : <BanknoteArrowUp size={20} />}
                </button>
              )
            }
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
  expireDate?: string;
  status?: "PAID" | "EXPIRING" | "EXPIRED" | "OK";
  action?: React.ReactNode;
};

function TelemetriaCard({
  icon,
  label,
  value,
  expireDate,
  status = "OK",
  action,
}: TelemetriaCardProps) {
  const statusStyles = {
    PAID: "bg-success/10 border-success/30 text-success",
    EXPIRING: "bg-warning/10 border-warning/30 text-warning",
    EXPIRED: "bg-error border-error/40 text-white shadow-lg shadow-error/20",
    OK: "bg-alternative-bg border-border",
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${statusStyles[status]}`}
    >
      <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>

        {action}
      </div>

      {expireDate && (
        <div
          className={`text-sm ${status === "EXPIRED" ? "text-white" : "text-muted"}`}
        >
          Vencimento: {expireDate}
        </div>
      )}

      <div
        className={`text-xl font-bold ${
          status === "EXPIRED" ? "text-white" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
