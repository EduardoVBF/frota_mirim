"use client";
import {
  VehicleUsage,
  VehicleUsageFilters,
} from "@/services/vehicleUsage.service";
import { Filter, FilterX, Plus, ClockCheck, Car, Edit2 } from "lucide-react";
import { Vehicle, getVehicles } from "@/services/vehicles.service";
import { User, getAdminUsers } from "@/services/users.service";
import VehicleUsageFormModal from "./vehicleUsageFormModal";
import { useState, useEffect, useMemo } from "react";
import FilterChips from "../fuel-supply/FilterChips";
import PrimarySelect from "../form/primarySelect";
import LoaderComp from "../loaderComp";
import Link from "next/link";

export function VehicleUsageTable({
  isVehiclePage = false,
  vehicle,
  usages,
  isLoading,
  filters,
  setFilters,
  onChange,
}: {
  isVehiclePage?: boolean;
  vehicle?: Vehicle;
  usages: VehicleUsage[];
  isLoading: boolean;
  filters: VehicleUsageFilters;
  setFilters: (filters: Partial<VehicleUsageFilters>) => void;
  onChange: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUsage, setEditingUsage] = useState<VehicleUsage | null>(null);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.userId) count++;
    if (filters.assistantId) count++;
    if (filters.vehicleId) count++;
    return count;
  }, [filters]);

  const vehicleMap = useMemo(() => {
    return Object.fromEntries(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const userMap = useMemo(() => {
    return Object.fromEntries(users.map((u) => [u.id, u]));
  }, [users]);

  const handleClearFilters = () => {
    setFilters({
      type: undefined,
      userId: undefined,
    });
  };

  const fetchVehicles = async () => {
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
  };

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchVehicles();
    fetchUsers();
  }, []);

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <VehicleUsageFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onChange}
        vehicle={vehicle}
        initialData={editingUsage || undefined}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <ClockCheck size={30} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Eventos de Entrada/Saída</h2>
            {isVehiclePage && vehicle && (
              <div className="flex items-center gap-1">
                <Car size={20} />
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
                type: filters.type === value ? undefined : value,
              })
            }
            options={[
              { label: "Entrada", value: "ENTRY" },
              { label: "Saída", value: "EXIT" },
            ]}
          />

          {!isVehiclePage && (
            <PrimarySelect
              label="Veículo"
              width="fit"
              className="min-w-50"
              value={filters.vehicleId || ""}
              onChange={(value) =>
                setFilters({
                  vehicleId: (value as string) || undefined,
                })
              }
              options={vehicles.map((v) => ({
                label: `${v.modelo} (${v.placa})`,
                value: v.id,
              }))}
            />
          )}

          <PrimarySelect
            label="Usuário"
            width="fit"
            className="min-w-70"
            value={filters.userId || ""}
            onChange={(value) =>
              setFilters({
                userId: (value as string) || undefined,
              })
            }
            options={users.map((u) => ({
              label: `${u.firstName} ${u.lastName}`,
              value: u.id,
            }))}
          />

          <PrimarySelect
            label="Assistente"
            width="fit"
            className="min-w-70"
            value={filters.assistantId || ""}
            onChange={(value) =>
              setFilters({
                assistantId: (value as string) || undefined,
              })
            }
            options={[
              ...users.map((u) => ({
                label: `${u.firstName} ${u.lastName}`,
                value: u.id,
              })),
            ]}
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
                <th className="px-6 py-4">Assistente</th>
                <th className="px-6 py-4 text-right">Ações</th>
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
                usages.map((usage) => (
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

                    <td className="px-6 py-4">{usage.km} Km</td>

                    <td className="px-6 py-4">
                      {vehicleMap[usage.vehicleId]
                        ? (() => {
                            const vehicle = vehicleMap[usage.vehicleId];

                            return (
                              <Link
                                href={`/veiculos/${vehicle?.placa}`}
                                className="flex flex-col gap-1"
                              >
                                <p className="text-sm font-bold text-muted">
                                  {vehicle?.modelo}
                                </p>

                                <p className="text-xs font-bold uppercase px-2 py-1 rounded bg-background border border-border w-fit">
                                  {vehicle?.placa}
                                </p>
                              </Link>
                            );
                          })()
                        : "Veículo não encontrado"}
                    </td>

                    <td className="px-6 py-4">
                      {usage.userId && userMap[usage.userId] ? (
                        <div>
                          <p className="text-sm font-bold text-muted">
                            {userMap[usage.userId]?.firstName}{" "}
                            {userMap[usage.userId]?.lastName}
                          </p>
                        </div>
                      ) : (
                        "Usuário não encontrado"
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {usage.assistantId && userMap[usage.assistantId] ? (
                        <div>
                          <p className="text-sm font-bold text-muted">
                            {userMap[usage.assistantId]?.firstName}{" "}
                            {userMap[usage.assistantId]?.lastName}
                          </p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUsage(usage);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
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
