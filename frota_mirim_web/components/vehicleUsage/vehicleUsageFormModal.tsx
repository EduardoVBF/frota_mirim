"use client";
import {
  createVehicleUsage,
  VehicleUsageType,
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

export default function VehicleUsageFormModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [vehicleId, setVehicleId] = useState("");
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<"ENTRY" | "EXIT">("ENTRY");
  const [km, setKm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    setVehicleId("");
    setUserId("");
    setType("ENTRY");
    setKm("");
    onClose();
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVehicles({
        limit: 1000,
        page: 1,
      });

      setVehicles(data.vehicles);
    } catch {
      toast.error("Erro ao buscar os veículos");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        limit: 1000,
        page: 1,
      });

      setUsers(data.users);
    } catch {
      toast.error("Erro ao buscar os usuários");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createVehicleUsage({
        vehicleId,
        userId,
        type,
        km: Number(km),
        eventAt: new Date(),
      });

      toast.success("Evento registrado!");
      onSuccess();
      handleClose();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar a categoria");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao salvar a categoria");
          return;
        }
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar a categoria");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title="Novo Evento"
      footer={
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 bg-accent text-white rounded-xl font-bold ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      }
    >
      <Toaster />
      <div className="space-y-4">
        <PrimarySelect
          label="Veículo"
          value={vehicleId}
          onChange={(val) => setVehicleId(val)}
          options={vehicles.map((v) => ({
            label: v.placa + " " + v.modelo,
            value: v.id,
          }))}
        />

        {vehicleId && (
          <div className="flex items-center gap-3">
            {vehicleId && (
              <div className="flex items-center gap-1">
                <Gauge size={20} className="text-muted" />
                <p className="text-sm text-muted">
                  Último registro:{" "}
                  {vehicles.find((v) => v.id === vehicleId)?.kmAtual} Km
                </p>
              </div>
            )}
          </div>
        )}

        <PrimarySelect
          label="Usuário"
          value={userId}
          onChange={(val) => setUserId(val)}
          options={users.map((u) => ({
            label: u.firstName + " " + u.lastName,
            value: u.id,
          }))}
          error={errors.userId || ""}
        />

        <PrimaryInput
          label="KM"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          error={errors.km || ""}
        />

        <PrimarySelect
          label="Tipo"
          value={type}
          onChange={(val) => setType(val as VehicleUsageType)}
          options={[
            { label: "Entrada - Check-in", value: "ENTRY" },
            { label: "Saída - Check-out", value: "EXIT" },
          ]}
          error={errors.type || ""}
        />
      </div>
    </PrimaryModal>
  );
}
