"use client";
import { createMaintenance } from "@/services/maintenance.service";
import { getVehicles, Vehicle } from "@/services/vehicles.service";
import PrimarySelect from "@/components/form/primarySelect";
import PrimaryModal from "@/components/form/primaryModal";
import PrimaryInput from "@/components/form/primaryInput";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Car, Gauge } from "lucide-react";
import toast from "react-hot-toast";

export default function MaintenanceFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState<"PREVENTIVE" | "CORRECTIVE">("PREVENTIVE");
  const [odometer, setOdometer] = useState("");
  const [performerType, setPerformerType] = useState<"INTERNAL" | "EXTERNAL">(
    "INTERNAL",
  );
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await getVehicles({
          page: 1,
          limit: 1000,
        });

        setVehicles(data.vehicles);
      } catch {
        toast.error("Erro ao carregar veículos");
      }
    }

    if (open) fetchVehicles();
  }, [open]);

  const resetForm = () => {
    setVehicleId("");
    setType("PREVENTIVE");
    setOdometer("");
    setDescription("");
  };

  const handleClose = () => {
    resetForm();
    setVehicleId("");
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const maintenance = await createMaintenance({
        vehicleId,
        type,
        performerType,
        odometer: Number(odometer),
        description,
      });

      toast.success("Manutenção criada");

      handleClose();

      router.push(`/manutencoes/${maintenance.id}`);
    } catch {
      toast.error("Erro ao criar manutenção");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title="Nova manutenção"
      footer={
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 bg-accent text-white rounded-xl font-bold ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Criando..." : "Criar manutenção"}
        </button>
      }
    >
      <div className="space-y-4">
        <PrimarySelect
          label="Veículo"
          value={vehicleId}
          onChange={(val) => setVehicleId(val as string)}
          options={vehicles.map((v) => ({
            label: `${v.modelo} (${v.placa})`,
            value: v.id,
          }))}
        />

        {vehicleId !== "" && (
          <div className="flex items-center gap-3">
            {vehicleId && (
              <div className="flex items-center gap-1">
                <Car size={20} className="text-muted" />
                <p className="text-sm text-muted">
                  {vehicles.find((v) => v.id === vehicleId)?.modelo ||
                    "Veículo"}{" "}
                  - {vehicles.find((v) => v.id === vehicleId)?.placa || ""}
                </p>
              </div>
            )}
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
          label="Tipo de manutenção"
          value={type}
          onChange={(val) => setType(val as "PREVENTIVE" | "CORRECTIVE")}
          options={[
            { label: "Preventiva", value: "PREVENTIVE" },
            { label: "Corretiva", value: "CORRECTIVE" },
          ]}
        />

        <PrimarySelect
          label="Local da manutenção"
          value={performerType}
          onChange={(val) => setPerformerType(val as "INTERNAL" | "EXTERNAL")}
          options={[
            { label: "Interno", value: "INTERNAL" },
            { label: "Externo", value: "EXTERNAL" },
          ]}
        />

        <PrimaryInput
          label="KM do veículo"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
        />

        <PrimaryInput
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </PrimaryModal>
  );
}
