"use client";
import {
  Maintenance,
  MaintenanceFilters,
  MaintenanceStatus,
} from "@/services/maintenance.service";
import { Filter, FilterX, Search, Wrench, Plus, Eye } from "lucide-react";
import MaintenanceFormModal from "./maintenanceFormModal";
import FilterChips from "../fuel-supply/FilterChips";
import LoaderComp from "../loaderComp";
import { useState } from "react";
import Link from "next/link";

export function MaintenanceTable({
  maintenances,
  isLoading,
  filters,
  setFilters,
}: {
  maintenances: Maintenance[];
  isLoading: boolean;
  filters: MaintenanceFilters & { search?: string };
  setFilters: (filters: Partial<MaintenanceFilters>) => void;
  onChange: () => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeFiltersCount =
    (filters.type ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.vehicleId ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: undefined,
      status: undefined,
      vehicleId: undefined,
    });
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <MaintenanceFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Wrench size={26} />
          </div>

          <h2 className="text-lg font-bold">Manutenções</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg"
          >
            {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
            Filtros
          </button>

          {activeFiltersCount > 0 && (
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
              {activeFiltersCount} filtro(s)
            </span>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            <Plus size={18} />
            Nova manutenção
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border flex items-end gap-4">
          {/* SEARCH */}

          <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm h-fit">
            <Search size={18} className="text-muted" />

            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({
                  search: e.target.value,
                })
              }
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Buscar manutenção..."
            />
          </div>

          <div className="flex items-center gap-4">
            {/* TIPO */}
            <FilterChips
              label="Tipo"
              value={filters.type || ""}
              onChange={(value) =>
                setFilters({
                  type:
                    filters.type === value
                      ? undefined
                      : (value as "PREVENTIVE" | "CORRECTIVE"),
                })
              }
              options={[
                {
                  label: "Preventiva",
                  value: "PREVENTIVE",
                },
                {
                  label: "Corretiva",
                  value: "CORRECTIVE",
                },
              ]}
            />

            {/* STATUS */}
            <FilterChips
              label="Status"
              value={filters.status || ""}
              onChange={(value) =>
                setFilters({
                  status:
                    filters.status === value
                      ? undefined
                      : (value as MaintenanceStatus),
                })
              }
              options={[
                {
                  label: "Aberta",
                  value: "OPEN",
                },
                {
                  label: "Em andamento",
                  value: "IN_PROGRESS",
                },
                {
                  label: "Concluída",
                  value: "COMPLETED",
                },
                {
                  label: "Cancelada",
                  value: "CANCELLED",
                },
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
        </div>
      )}

      {/* TABLE */}
      {isLoading ? (
        <div className="p-6">
          <LoaderComp />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">KM</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {maintenances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    Nenhuma manutenção encontrada
                  </td>
                </tr>
              ) : (
                maintenances.map((maintenance) => (
                  <tr key={maintenance.id} className="border-b border-border">
                    <td className="px-6 py-4">
                      {new Date(maintenance.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">{maintenance.vehicleId}</td>

                    <td className="px-6 py-4">
                      {maintenance.type === "PREVENTIVE"
                        ? "Preventiva"
                        : "Corretiva"}
                    </td>

                    <td className="px-6 py-4">{maintenance.status}</td>

                    <td className="px-6 py-4">{maintenance.odometer} km</td>

                    <td className="px-6 py-4">R$ {maintenance.totalCost}</td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/manutencoes/${maintenance.id}`}
                        className="p-2 hover:text-accent"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
