"use client";
import {
  createVehicleUsage,
  VehicleUsageType,
  VehicleUsage,
  updateVehicleUsage,
  getVehicleUsages,
} from "@/services/vehicleUsage.service";
import { getVehicles, Vehicle } from "@/services/vehicles.service";
import { getAdminUsers, User } from "@/services/users.service";
import { translateApiErrors } from "@/utils/translateApiError";
import { useState, useEffect, useCallback } from "react";
import PrimarySelect from "../form/primarySelect";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import toast, { Toaster } from "react-hot-toast";
import { Gauge } from "lucide-react";
import { AxiosError } from "axios";
import dayjs from "dayjs";

export default function VehicleUsageFormModal({
  open,
  onClose,
  onSuccess,
  vehicle,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: Vehicle;
  initialData?: VehicleUsage;
}) {
  const [vehicleId, setVehicleId] = useState("");
  const [userId, setUserId] = useState("");
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [type, setType] = useState<"ENTRY" | "EXIT">("ENTRY");
  const [km, setKm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [eventAt, setEventAt] = useState("");
  const [lastEvent, setLastEvent] = useState<VehicleUsage | null>(null);

  // INIT
  useEffect(() => {
    if (initialData) {
      setVehicleId(initialData.vehicleId);
      setUserId(initialData.userId || "");
      setAssistantId(initialData.assistantId || null);
      setType(initialData.type);
      setKm(initialData.km.toString());
      setEventAt(dayjs(initialData.eventAt).format("YYYY-MM-DDTHH:mm"));
    } else {
      setVehicleId("");
      setUserId("");
      setAssistantId(null);
      setType("ENTRY");
      setKm("");
      setEventAt(dayjs().format("YYYY-MM-DDTHH:mm"));
    }
  }, [initialData, open]);

  // FETCH
  const fetchVehicles = useCallback(async () => {
    try {
      const data = await getVehicles({ limit: 1000, page: 1 });
      setVehicles(data.vehicles);
    } catch {
      toast.error("Erro ao buscar veículos");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAdminUsers({ limit: 1000, page: 1 });
      setUsers(data.users);
    } catch {
      toast.error("Erro ao buscar usuários");
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchUsers();
  }, [fetchVehicles, fetchUsers]);

  // LAST EVENT
  useEffect(() => {
    if (!vehicleId || initialData) return;

    async function fetchLastEvent() {
      try {
        const data = await getVehicleUsages({
          vehicleId,
          page: 1,
          limit: 1,
        });

        const last = data.usages[0];
        setLastEvent(last);

        if (last) {
          if (last.type === "ENTRY") setType("EXIT");
          else setType("ENTRY");
        }
      } catch {}
    }

    fetchLastEvent();
  }, [vehicleId, initialData]);

  // SMART DATE
  useEffect(() => {
    if (!lastEvent || initialData) return;

    const now = dayjs();

    const safeNow = now.isBefore(dayjs(lastEvent.eventAt))
      ? dayjs(lastEvent.eventAt).add(1, "minute")
      : now;

    setEventAt(safeNow.format("YYYY-MM-DDTHH:mm"));

    if (type === "EXIT" && lastEvent.type === "ENTRY") {
      setUserId(lastEvent.userId || "");
      setAssistantId(lastEvent.assistantId || null);
    }
  }, [lastEvent, type, initialData]);

  // VALIDATIONS
  const isInvalidFlow = () => {
    if (!lastEvent) return false;

    if (type === "ENTRY" && lastEvent.type === "ENTRY") return true;
    if (type === "EXIT" && lastEvent.type !== "ENTRY") return true;

    return false;
  };

  const isInvalidDate = () => {
    if (!lastEvent) return false;

    const selected = dayjs(eventAt);

    return selected.isBefore(dayjs(lastEvent.eventAt));
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (isInvalidFlow()) {
      toast.error("Fluxo inválido");
      return;
    }

    if (isInvalidDate()) {
      toast.error("Data inválida");
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        await updateVehicleUsage(initialData.id, {
          vehicleId,
          userId,
          assistantId: assistantId || undefined,
          type,
          km: Number(km),
          eventAt: new Date(eventAt),
        });
        toast.success("Evento atualizado!");
      } else {
        await createVehicleUsage({
          vehicleId,
          userId,
          type,
          assistantId: assistantId || undefined,
          km: Number(km),
          eventAt: new Date(eventAt),
        });
        toast.success("Evento registrado!");
      }

      onSuccess();
      handleClose();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );
        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar");
      } else {
        toast.error("Erro ao salvar");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVehicleId("");
    setUserId("");
    setAssistantId(null);
    setType("ENTRY");
    setKm("");
    setEventAt("");
    setLastEvent(null);
    onClose();
  };

  useEffect(() => {
    if (vehicle && open) setVehicleId(vehicle.id);
  }, [vehicle, open]);

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title={
        lastEvent?.type === "ENTRY"
          ? "Registrar saída do veículo"
          : "Registrar entrada do veículo"
      }
      footer={
        <button
          onClick={handleSubmit}
          disabled={loading || isInvalidFlow() || isInvalidDate()}
          className="px-6 py-2 bg-accent text-white rounded-xl font-bold"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      }
    >
      <Toaster />

      <div className="space-y-4">
        <PrimarySelect
          searchable
          label="Veículo"
          value={vehicle ? vehicle.id : vehicleId}
          onChange={(val) => setVehicleId(val as string)}
          options={vehicles.map((v) => ({
            label: v.placa + " " + v.modelo,
            value: v.id,
          }))}
          disabled={!!vehicle}
        />

        {(vehicleId || lastEvent) && (
          <div className="flex items-center gap-4">
            {vehicleId && (
              <div className="flex items-center text-sm text-muted">
                <Gauge size={18} className="mr-1" />
                KM atual: {vehicles.find((v) => v.id === vehicleId)?.kmAtual}
              </div>
            )}
            {lastEvent && (
              <div className="text-xs text-muted">
                Último evento:{" "}
                <strong>
                  {lastEvent.type === "ENTRY" ? "Entrada" : "Saída"}
                </strong>{" "}
                em {dayjs(lastEvent.eventAt).format("DD/MM HH:mm")}
              </div>
            )}
          </div>
        )}

        <PrimarySelect
          searchable
          label="Usuário"
          value={userId}
          onChange={(val) => setUserId(val as string)}
          options={users.map((u) => ({
            label: u.firstName + " " + u.lastName,
            value: u.id,
          }))}
          error={errors.userId}
        />

        <PrimarySelect
          searchable
          label="Assistente"
          value={assistantId || ""}
          onChange={(val) => setAssistantId((val as string) || null)}
          options={[
            { label: "Nenhum", value: "" },
            ...users.map((u) => ({
              label: u.firstName + " " + u.lastName,
              value: u.id,
            })),
          ]}
        />

        {lastEvent?.type === "ENTRY" && (
          <p className="text-xs text-muted">
            Motorista e ajudante sugeridos com base na última entrada
          </p>
        )}

        <PrimaryInput
          label="Data e Hora"
          type="datetime-local"
          value={eventAt}
          onChange={(e) => setEventAt(e.target.value)}
          error={errors.eventAt}
        />

        {isInvalidFlow() && (
          <p className="text-xs text-red-500">
            {type === "ENTRY"
              ? "Este veículo já está em uso"
              : "Não existe entrada aberta"}
          </p>
        )}

        {isInvalidDate() && (
          <p className="text-xs text-red-500">
            Data deve ser após o último evento
          </p>
        )}

        <PrimaryInput
          label="KM"
          type="number"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          error={errors.km}
          decimalScale={1}
        />

        <PrimarySelect
          label="Tipo"
          value={type}
          onChange={(val) => setType(val as VehicleUsageType)}
          options={[
            { label: "Entrada - Início de uso", value: "ENTRY" },
            { label: "Saída - Fim de uso", value: "EXIT" },
          ]}
          disabled={!!lastEvent}
        />
      </div>
    </PrimaryModal>
  );
}
