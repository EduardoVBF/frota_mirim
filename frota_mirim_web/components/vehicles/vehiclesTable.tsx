"use client";

import {
  Vehicle,
  createVehicle,
  updateVehicle,
  VehiclePayload,
  UpdateVehiclePayload,
  VehicleFilters,
} from "@/services/vehicles.service";
import { Edit2, Search, Filter, FilterX, Plus } from "lucide-react";
import VehicleFormModal from "../vehicle/vehicleFormModal";
import FilterChips from "../fuel-supply/FilterChips";
import toast, { Toaster } from "react-hot-toast";
import { StatusDot } from "../motion/statusDot";
import LoaderComp from "../loaderComp";
import { useState } from "react";
import Link from "next/link";

export function VehicleTable({
  vehicles,
  isLoading,
  filters,
  setFilters,
  onVehicleChange,
}: {
  vehicles: Vehicle[];
  filters: VehicleFilters;
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilters>>;
  onVehicleChange: () => void;
  isLoading: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.tipo?.length ? 1 : 0) +
    (filters.isActive !== undefined ? 1 : 0);

  const handleFormSubmit = async (data: VehiclePayload) => {
    setLoading(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, data as UpdateVehiclePayload);
        toast.success("Veículo atualizado");
      } else {
        await createVehicle(data);
        toast.success("Veículo criado");
      }

      setIsModalOpen(false);
      setEditingVehicle(null);
      await onVehicleChange();
    } catch {
      toast.error("Erro ao salvar veículo");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      tipo: undefined,
      isActive: undefined,
    });
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <Toaster />

      <VehicleFormModal
        key={editingVehicle ? `edit-${editingVehicle.id}` : "new-vehicle"}
        open={isModalOpen}
        onSubmit={handleFormSubmit}
        loading={loading}
        initialData={editingVehicle || undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
          setLoading(false);
        }}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder="Buscar placa, modelo ou marca..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <>
                <FilterX size={16} /> Filtros
              </>
            ) : (
              <>
                <Filter size={16} /> Filtros
              </>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
              {activeFiltersCount} filtro(s)
            </span>
          )}

          <button
            onClick={() => {
              setEditingVehicle(null);
              setIsModalOpen(true);
            }}
            className="cursor-pointer flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20"
          >
            <Plus size={18} /> Cadastrar Veículo
          </button>
        </div>
      </div>

      {/* FILTROS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border bg-background/40 flex flex-wrap gap-4 items-end">
          <FilterChips
            label="Tipo"
            value={filters.tipo || []}
            onChange={(value) =>
              setFilters({
                ...filters,
                tipo: value.length ? value : undefined,
              })
            }
            options={[
              { label: "Carro", value: "CARRO" },
              { label: "Caminhão", value: "CAMINHAO" },
              { label: "Moto", value: "MOTO" },
              { label: "Ônibus", value: "ONIBUS" },
            ]}
            multi
          />

          <FilterChips
            label="Status"
            value={
              filters.isActive === undefined
                ? ""
                : filters.isActive
                  ? "true"
                  : "false"
            }
            onChange={(value) =>
              setFilters({
                ...filters,
                isActive:
                  filters.isActive?.toString() === value
                    ? undefined
                    : value === "true"
                      ? true
                      : value === "false"
                        ? false
                        : undefined,
              })
            }
            options={[
              { label: "Ativo", value: "true" },
              { label: "Inativo", value: "false" },
            ]}
          />

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="ml-auto px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <th className="px-6 py-4 font-bold">Placa</th>
              <th className="px-6 py-4 font-bold">Modelo</th>
              <th className="px-6 py-4 font-bold">Ano</th>
              <th className="px-6 py-4 font-bold">Tipo</th>
              <th className="px-6 py-4 font-bold">KM Atual</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <LoaderComp />
                </td>
              </tr>
            </tbody>
          ) : vehicles.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  Nenhum veículo encontrado.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-border">
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="group hover:bg-background/50 transition-colors text-sm"
                >
                  <td className="px-6 py-4 font-mono font-bold">
                    <Link href={`/veiculos/${vehicle.placa}`}>
                      <span className="text-sm font-bold uppercase px-2 py-1 rounded bg-background border border-border">
                        {vehicle.placa}
                      </span>
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">
                        {vehicle.modelo}
                      </span>
                      <span className="text-xs text-muted">
                        {vehicle.marca}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs">{vehicle.ano}</td>
                  <td className="px-6 py-4 text-xs">{vehicle.tipo}</td>
                  <td className="px-6 py-4 text-xs">
                    {vehicle.kmAtual.toLocaleString()} km
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-2 text-xs font-bold ${
                        vehicle.isActive ? "text-success" : "text-error"
                      }`}
                    >
                      <StatusDot
                        color={
                          vehicle.isActive ? "var(--success)" : "var(--error)"
                        }
                      />
                      {vehicle.isActive ? "Ativo" : "Inativo"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setEditingVehicle(vehicle);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
