"use client";
import {
  createMaintenance,
  Maintenance,
  updateMaintenance,
} from "@/services/maintenance.service";
import { getVehicles, Vehicle } from "@/services/vehicles.service";
import PrimarySelect from "@/components/form/primarySelect";
import PrimaryModal from "@/components/form/primaryModal";
import PrimaryInput from "@/components/form/primaryInput";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Car, Gauge } from "lucide-react";
import toast from "react-hot-toast";

export default function MaintenanceFormModal({
  open,
  onClose,
  maintenance,
  vehicle,
}: {
  open: boolean;
  onClose: () => void;
  maintenance?: Maintenance | null;
  vehicle?: Vehicle | null;
}) {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");

  const [type, setType] = useState<"PREVENTIVE" | "CORRECTIVE">("PREVENTIVE");
  const [performerType, setPerformerType] = useState<"INTERNAL" | "EXTERNAL">(
    "INTERNAL",
  );

  const [odometer, setOdometer] = useState("");
  const [description, setDescription] = useState("");

  const [blocksVehicle, setBlocksVehicle] = useState(false);

  const [loading, setLoading] = useState(false);

  const isEdit = !!maintenance;

  const selectedVehicle = useMemo(() => {
    if (vehicle) return vehicle;
    return vehicles.find((v) => v.id === vehicleId);
  }, [vehicle, vehicles, vehicleId]);

  /**
   * FETCH VEHICLES
   */
  useEffect(() => {
    if (!open || vehicle) return;

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

    fetchVehicles();
  }, [open, vehicle]);

  /**
   * PREFILL FORM
   */
  useEffect(() => {
    if (!open) return;

    if (maintenance) {
      setVehicleId(maintenance.vehicleId);
      setType(maintenance.type);
      setPerformerType(maintenance.performerType);
      setOdometer(String(maintenance.odometer));
      setDescription(maintenance.description || "");
      setBlocksVehicle(maintenance.blocksVehicle ?? false);
    } else {
      setVehicleId(vehicle?.id || "");
      setType("PREVENTIVE");
      setPerformerType("INTERNAL");
      setOdometer("");
      setDescription("");
      setBlocksVehicle(false);
    }
  }, [maintenance, open, vehicle]);

  const handleClose = () => {
    setVehicleId("");
    setType("PREVENTIVE");
    setPerformerType("INTERNAL");
    setOdometer("");
    setDescription("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!vehicleId) {
      toast.error("Selecione um veículo");
      return;
    }

    if (!odometer) {
      toast.error("Informe o KM");
      return;
    }

    setLoading(true);

    try {
      if (isEdit && maintenance) {
        await updateMaintenance(maintenance.id, {
          vehicleId,
          type,
          performerType,
          odometer: Number(odometer),
          description,
          blocksVehicle,
        });

        toast.success("Manutenção atualizada");
      } else {
        const created = await createMaintenance({
          vehicleId,
          type,
          performerType,
          odometer: Number(odometer),
          description,
          blocksVehicle,
        });

        toast.success("Manutenção criada");

        router.push(`/manutencoes/${created.id}`);
      }

      handleClose();
    } catch {
      toast.error("Erro ao salvar manutenção");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title={isEdit ? "Editar manutenção" : "Nova manutenção"}
      footer={
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 bg-accent text-white rounded-xl font-bold ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? isEdit
              ? "Salvando..."
              : "Criando..."
            : isEdit
              ? "Salvar alterações"
              : "Criar manutenção"}
        </button>
      }
    >
      <div className="space-y-4">
        {/* VEICULO */}
        <PrimarySelect
          searchable
          label="Veículo"
          value={vehicleId}
          disabled={!!vehicle}
          onChange={(val) => setVehicleId(val as string)}
          options={vehicles.map((v) => ({
            label: `${v.modelo} (${v.placa})`,
            value: v.id,
          }))}
        />

        {/* INFO DO VEICULO */}
        {selectedVehicle && (
          <div className="flex items-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Car size={18} />
              <span>
                {selectedVehicle.modelo} - {selectedVehicle.placa}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Gauge size={18} />
              <span>Último KM: {selectedVehicle.kmAtual} km</span>
            </div>
          </div>
        )}

        {/* TIPO */}
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
          label="Disponibilidade do veículo"
          value={blocksVehicle ? "YES" : "NO"}
          onChange={(val) => setBlocksVehicle(val === "YES")}
          options={[
            {
              label: "Veículo continua disponível",
              value: "NO",
            },
            {
              label: "Veículo ficará indisponível",
              value: "YES",
            },
          ]}
        />

        {blocksVehicle && (
          <div className="text-xs text-red-500">
            ⚠️ O veículo ficará indisponível até a conclusão da manutenção
          </div>
        )}

        {/* LOCAL */}
        <PrimarySelect
          label="Local da manutenção"
          value={performerType}
          onChange={(val) => setPerformerType(val as "INTERNAL" | "EXTERNAL")}
          options={[
            { label: "Interno", value: "INTERNAL" },
            { label: "Externo", value: "EXTERNAL" },
          ]}
        />

        {/* KM */}
        <PrimaryInput
          label="KM do veículo"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          decimalScale={1}
        />

        {/* DESCRIÇÃO */}
        <PrimaryInput
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </PrimaryModal>
  );
}
