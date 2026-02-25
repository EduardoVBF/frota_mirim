"use client";
import {
  VehicleUsage,
  VehicleUsageFilters,
} from "@/services/vehicleUsage.service";
import { Vehicle, getVehicles } from "@/services/vehicles.service";
import { User, getAdminUsers } from "@/services/users.service";
import VehicleUsageFormModal from "./vehicleUsageFormModal";
import { useState, useEffect, useCallback } from "react";
import { Filter, FilterX, Plus, ClockCheck } from "lucide-react";
import FilterChips from "../fuel-supply/FilterChips";
import LoaderComp from "../loaderComp";
import PrimarySelect from "../form/primarySelect";

export function VehicleUsageTable({
  usages,
  isLoading,
  filters,
  setFilters,
  onChange,
}: {
  usages: VehicleUsage[];
  isLoading: boolean;
  filters: VehicleUsageFilters;
  setFilters: (filters: VehicleUsageFilters) => void;
  onChange: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const activeFiltersCount = Object.values(filters).filter(
    (f) => f !== undefined,
  ).length;

  const handleClearFilters = () => {
    setFilters({
      //   search: "",
      type: undefined,
    });
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
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <VehicleUsageFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onChange}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <ClockCheck size={30} />
          </div>
          <h2 className="text-lg font-bold">Eventos de Entrada/Saída</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg"
          >
            {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
            Filtros
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            <Plus size={18} />
            Novo Evento
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border bg-background/40 flex gap-4 items-end">
          <FilterChips
            label="Tipo"
            value={filters.type || ""}
            onChange={(value) =>
              setFilters({
                ...filters,
                type: filters.type === value ? undefined : value,
              })
            }
            options={[
              { label: "Entrada", value: "ENTRY" },
              { label: "Saída", value: "EXIT" },
            ]}
          />

          <PrimarySelect
            label="Veículo"
            width="fit"
            className="min-w-50"
            value={filters.vehicleId || ""}
            onChange={(value) => {
              setFilters({
                ...filters,
                vehicleId: value || undefined,
              });
            }}
            options={vehicles.map((v) => ({
              label: `${v.modelo} (${v.placa})`,
              value: v.id,
            }))}
          />

          <PrimarySelect
            label="Usuário"
            width="fit"
            className="min-w-70"
            value={filters.userId || ""}
            onChange={(value) => {
              setFilters({
                ...filters,
                userId: value || undefined,
              });
            }}
            options={users.map((u) => ({
              label: `${u.firstName} ${u.lastName}`,
              value: u.id,
            }))}
          />

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="ml-auto px-4 py-2 text-sm rounded-lg border border-border"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="p-6">
          <LoaderComp />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">KM</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Usuário</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <LoaderComp />
                  </td>
                </tr>
              ) : usages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              ) : (
                usages.map((usage: VehicleUsage) => (
                  <tr key={usage.id} className="border-b border-border">
                    <td className="px-6 py-4">
                      <div>
                        <p>{new Date(usage.eventAt).toLocaleDateString()}</p>
                        <p>
                          {new Date(usage.eventAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold ${
                          usage.type === "ENTRY" ? "text-success" : "text-error"
                        }`}
                      >
                        {usage.type === "ENTRY" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{usage.km}</td>
                    <td className="px-6 py-4">
                      {vehicles.find((v) => v.id === usage.vehicleId) ? (
                        <div className="">
                          <p className="text-sm font-bold text-muted">
                            {vehicles.find((v) => v.id === usage.vehicleId)
                              ?.modelo || "Veículo Desconhecido"}
                          </p>
                          <p className="text-xs font-bold uppercase px-2 py-1 rounded bg-background border border-border w-fit">
                            {vehicles.find((v) => v.id === usage.vehicleId)
                              ?.placa || "-"}
                          </p>
                        </div>
                      ) : (
                        "Veículo não encontrado"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {users.find((u) => u.id === usage.userId) ? (
                        <div>
                          <p className="text-sm font-bold text-muted">
                            {users.find((u) => u.id === usage.userId)
                              ?.firstName || "Usuário"}{" "}
                            {users.find((u) => u.id === usage.userId)
                              ?.lastName || ""}
                          </p>
                        </div>
                      ) : (
                        "Usuário não encontrado"
                      )}
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
