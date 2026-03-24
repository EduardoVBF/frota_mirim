"use client";
import {
  Maintenance,
  MaintenanceFilters,
  MaintenanceStatus,
} from "@/services/maintenance.service";
import { Filter, FilterX, Wrench, Plus, Eye, Pencil, Car } from "lucide-react";
import MaintenanceFormModal from "./maintenanceFormModal";
import { Vehicle } from "@/services/vehicles.service";
import FilterChips from "../fuel-supply/FilterChips";
import PrimarySelect from "../form/primarySelect";
import { useState, useMemo } from "react";
import LoaderComp from "../loaderComp";
import Link from "next/link";

export function MaintenanceTable({
  maintenances,
  isLoading,
  filters,
  setFilters,
  vehicles,
  onChange,
  isVehiclePage = false,
  vehicle,
}: {
  maintenances: Maintenance[];
  isLoading: boolean;
  filters: MaintenanceFilters;
  setFilters: (filters: Partial<MaintenanceFilters>) => void;
  vehicles: Vehicle[];
  onChange: () => void;
  isVehiclePage?: boolean;
  vehicle?: Vehicle;
}) {
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vehicleMap = useMemo(() => {
    return Object.fromEntries(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const activeFiltersCount =
    (filters.type ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.vehicleId && !isVehiclePage ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      type: undefined,
      status: undefined,
    });
  };

  const handleStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
            Aberta
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full">
            Em andamento
          </span>
        );
      case "DONE":
        return (
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
            Concluída
          </span>
        );
      case "CANCELED":
        return (
          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <MaintenanceFormModal
        open={isModalOpen}
        maintenance={selectedMaintenance}
        vehicle={vehicle}
        onClose={() => {
          setSelectedMaintenance(null);
          setIsModalOpen(false);
          onChange();
        }}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Wrench size={26} />
          </div>

          <div>
            <h2 className="text-lg font-bold">Manutenções</h2>

            {isVehiclePage && vehicle && (
              <div className="flex items-center gap-1">
                <Car size={18} />
                <span className="text-sm font-bold">
                  {vehicle.placa} - {vehicle.modelo}
                </span>
              </div>
            )}
          </div>
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
          {!isVehiclePage && (
            <PrimarySelect
              label="Veículo"
              value={filters.vehicleId || ""}
              onChange={(val) =>
                setFilters({
                  vehicleId: (val as string) || undefined,
                })
              }
              options={[
                { label: "Todos os veículos", value: "" },
                ...vehicles.map((v) => ({
                  label: `${v.modelo} - ${v.placa}`,
                  value: v.id,
                })),
              ]}
              className="max-w-72"
            />
          )}

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
              { label: "Preventiva", value: "PREVENTIVE" },
              { label: "Corretiva", value: "CORRECTIVE" },
            ]}
          />

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
              { label: "Aberta", value: "OPEN" },
              { label: "Em andamento", value: "IN_PROGRESS" },
              { label: "Concluída", value: "DONE" },
              { label: "Cancelada", value: "CANCELED" },
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
      {isLoading ? (
        <div className="p-6">
          <LoaderComp />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Disponibilidade</th>
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    Nenhuma manutenção encontrada
                  </td>
                </tr>
              ) : (
                maintenances.map((maintenance) => {
                  const vehicle = vehicleMap[maintenance.vehicleId];

                  return (
                    <tr key={maintenance.id} className="border-b border-border">
                      <td className="px-6 py-4 font-bold">
                        {maintenance.sequenceId?.toString().padStart(5, "0")}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(maintenance.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        {vehicle ? (
                          <Link
                            href={`/veiculos/${vehicle.placa}`}
                            className="flex flex-col"
                          >
                            <span className="text-sm font-bold text-muted">
                              {vehicle.modelo}
                            </span>

                            <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-background border border-border w-fit">
                              {vehicle.placa}
                            </span>
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {vehicle ? (
                          <span
                            className={
                              maintenance.blocksVehicle
                                ? "text-error"
                                : "text-success"
                            }
                          >
                            {maintenance.blocksVehicle
                              ? "Indisponível"
                              : "Disponível"}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {maintenance.type === "PREVENTIVE"
                          ? "Preventiva"
                          : "Corretiva"}
                      </td>

                      <td className="px-6 py-4">
                        {handleStatusBadge(maintenance.status)}
                      </td>

                      <td className="px-6 py-4">{maintenance.odometer} km</td>

                      <td className="px-6 py-4">R$ {maintenance.totalCost}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedMaintenance(maintenance);
                              setIsModalOpen(true);
                            }}
                            className="p-2 hover:text-accent"
                          >
                            <Pencil size={16} />
                          </button>

                          <Link
                            href={`/manutencoes/${maintenance.id}`}
                            className="p-2 hover:text-accent"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
