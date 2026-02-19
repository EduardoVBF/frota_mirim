"use client";
import {
  FuelSupply,
  CreateFuelSupplyPayload,
} from "@/services/fuel-supply.service";
import {
  getVehicles,
  Vehicle,
  getVehicleById,
} from "@/services/vehicles.service";
import { translateApiErrors } from "@/utils/translateApiError";
import React, { useEffect, useState } from "react";
import PrimarySelect from "../form/primarySelect";
import PrimarySwitch from "../form/primarySwitch";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import { Gauge, Car } from "lucide-react";
import { toast } from "react-hot-toast";
import LoaderComp from "../loaderComp";
import { AxiosError } from "axios";

type Props = {
  open: boolean;
  loading: boolean;
  vehicleId?: string;
  initialData?: FuelSupply | null;
  onClose: () => void;
  onSubmit: (data: CreateFuelSupplyPayload) => void;
};

export default function FuelSupplyFormModal({
  open,
  loading,
  vehicleId,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [data, setData] = useState("");
  const [kmAtual, setKmAtual] = useState("");
  const [litros, setLitros] = useState("");
  const [valorLitro, setValorLitro] = useState("");
  const [tipoCombustivel, setTipoCombustivel] = useState<
    "GASOLINA" | "ETANOL" | "DIESEL"
  >("DIESEL");
  const [postoTipo, setPostoTipo] = useState<"INTERNO" | "EXTERNO">("INTERNO");
  const [postoNome, setPostoNome] = useState("");
  const [tanqueCheio, setTanqueCheio] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadVehicles() {
      try {
        if (vehicleId) {
          const res = await getVehicleById(vehicleId);
          setVehicles([res]);
        } else {
          const res = await getVehicles({ limit: 100 });
          setVehicles(res.vehicles);
        }
      } catch {
        toast.error("Erro ao carregar veículos");
      }
    }

    loadVehicles();
  }, [open, vehicleId]);

  // INITIAL DATA
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVehicleId(initialData.vehicleId);
      setData(new Date(initialData.data).toISOString().split("T")[0]);
      setKmAtual(String(initialData.kmAtual));
      setLitros(String(initialData.litros));
      setValorLitro(String(initialData.valorLitro));
      setTipoCombustivel(initialData.tipoCombustivel);
      setPostoTipo(initialData.postoTipo);
      setPostoNome(initialData.postoNome || "");
      setTanqueCheio(initialData.tanqueCheio);
    } else {
      setSelectedVehicleId(vehicleId || "");
      setData("");
      setKmAtual("");
      setLitros("");
      setValorLitro("");
      setPostoNome("");
      setTanqueCheio(false);
    }
  }, [initialData, open, vehicleId]);

  // SUBMIT
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const finalVehicleId = vehicleId || selectedVehicleId;

    if (!finalVehicleId) {
      toast.error("Selecione um veículo");
      return;
    }

    try {
      await onSubmit({
        vehicleId: finalVehicleId,
        data,
        kmAtual: Number(kmAtual),
        litros: Number(litros),
        valorLitro: Number(valorLitro),
        tipoCombustivel,
        postoTipo,
        postoNome,
        tanqueCheio,
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );
        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar");
      } else {
        toast.error("Erro inesperado");
      }
    }
  }

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title={initialData ? "Editar Abastecimento" : "Novo Abastecimento"}
      footer={
        <button
          type="submit"
          form="fuel-form"
          className="px-6 py-2 bg-accent text-white rounded-xl font-bold"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      }
    >
      {loading ? (
        <LoaderComp />
      ) : (
        <form id="fuel-form" onSubmit={handleSubmit} className="space-y-4">
          {!vehicleId && (
            <PrimarySelect
              label="Veículo"
              value={selectedVehicleId}
              onChange={(val) => setSelectedVehicleId(val as string)}
              options={vehicles.map((v) => ({
                label: `${v.modelo} - ${v.placa}`,
                value: v.id,
              }))}
              error={errors.vehicleId}
            />
          )}

          {(vehicleId || selectedVehicleId) && (
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
              {selectedVehicleId && (
                <div className="flex items-center gap-1">
                  <Gauge size={20} className="text-muted" />
                  <p className="text-sm text-muted">
                    Último registro:{" "}
                    {vehicles.find((v) => v.id === selectedVehicleId)?.kmAtual}{" "}
                    Km
                  </p>
                </div>
              )}
            </div>
          )}

          <PrimaryInput
            label="Data"
            type="datetime-local"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <PrimaryInput
            label="KM Atual"
            value={kmAtual}
            onChange={(e) => setKmAtual(e.target.value)}
          />

          <PrimaryInput
            label="Litros"
            value={litros}
            onChange={(e) => setLitros(e.target.value)}
          />

          <PrimaryInput
            label="Valor por Litro"
            value={valorLitro}
            onChange={(e) => setValorLitro(e.target.value)}
          />

          <PrimarySelect
            label="Combustível"
            value={tipoCombustivel}
            onChange={(val) =>
              setTipoCombustivel(val as "GASOLINA" | "ETANOL" | "DIESEL")
            }
            options={[
              { label: "Gasolina", value: "GASOLINA" },
              { label: "Etanol", value: "ETANOL" },
              { label: "Diesel", value: "DIESEL" },
            ]}
          />

          <PrimarySelect
            label="Posto"
            value={postoTipo}
            onChange={(val) => setPostoTipo(val as "INTERNO" | "EXTERNO")}
            options={[
              { label: "Interno", value: "INTERNO" },
              { label: "Externo", value: "EXTERNO" },
            ]}
          />

          <PrimaryInput
            label="Nome do Posto"
            value={postoNome}
            onChange={(e) => setPostoNome(e.target.value)}
          />

          <PrimarySwitch
            label="Tanque cheio"
            checked={tanqueCheio}
            onChange={setTanqueCheio}
          />
        </form>
      )}
    </PrimaryModal>
  );
}
