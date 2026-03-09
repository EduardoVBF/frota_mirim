"use client";
import {
  updateMaintenanceStatus,
  finalizeMaintenance,
  MaintenanceStatus,
} from "@/services/maintenance.service";
import { translateApiErrors } from "@/utils/translateApiError";
import { Circle, CheckCircle2, Loader2 } from "lucide-react";
import PrimaryModal from "../form/primaryModal";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function MaintenanceStatusModal({
  open,
  onClose,
  maintenanceId,
  currentStatus,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  maintenanceId: string;
  currentStatus: MaintenanceStatus;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState<MaintenanceStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus, open]);

  const allowedTransitions: Record<MaintenanceStatus, MaintenanceStatus[]> = {
    OPEN: ["IN_PROGRESS", "CANCELED"],
    IN_PROGRESS: ["DONE", "CANCELED", "OPEN"],
    DONE: [],
    CANCELED: [],
  };

  const handleSubmit = async () => {
    if (status === currentStatus) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      if (status === "DONE") {
        await finalizeMaintenance(maintenanceId);
        toast.success("Manutenção finalizada com sucesso");
      } else {
        await updateMaintenanceStatus(maintenanceId, status);
        toast.success("Status atualizado");
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar");
        return;
      }

      if (!err.response?.data) {
        toast.error("Erro ao salvar");
        return;
      }

      const { toastMessage } = translateApiErrors(err.response.data);

      toast.error(toastMessage || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { value: "OPEN", label: "Aberta", color: "text-yellow-500" },
    { value: "IN_PROGRESS", label: "Em andamento", color: "text-blue-500" },
    { value: "DONE", label: "Concluída", color: "text-green-500" },
    { value: "CANCELED", label: "Cancelada", color: "text-red-500" },
  ] as const;

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title="Alterar status da manutenção"
      footer={
        <button
          onClick={handleSubmit}
          disabled={loading || status === currentStatus}
          className="px-6 py-2 bg-accent text-white rounded-xl font-semibold flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      }
    >
      <div className="space-y-6">
        <div className="text-sm text-muted">
          Status atual:{" "}
          <span className="font-semibold">
            {statuses.find((s) => s.value === currentStatus)?.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statuses.map((s) => {
            const isCurrent = s.value === currentStatus;

            const isAllowed =
              allowedTransitions[currentStatus].includes(
                s.value as MaintenanceStatus,
              ) || isCurrent;

            const isSelected = status === s.value;

            return (
              <button
                key={s.value}
                disabled={!isAllowed}
                onClick={() => setStatus(s.value)}
                className={`
                  border rounded-xl p-4 text-left transition
                  ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-background"
                  }
                  ${
                    !isAllowed
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-accent"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle size={14} className={s.color} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>

                  {isCurrent && (
                    <CheckCircle2 size={16} className="text-accent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PrimaryModal>
  );
}