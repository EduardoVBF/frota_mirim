"use client";
import {
  Alert,
  AlertFilters,
  markAlertUnread,
  markAlertRead,
  resolveAlert,
} from "@/services/alerts.service";
import {
  Filter,
  FilterX,
  Search,
  Eye,
  Check,
  Bell,
  EyeOff,
  Car,
} from "lucide-react";
import AlertSeverityBadge from "./alertSeverityBadge";
import FilterChips from "../fuel-supply/FilterChips";
import AlertTypeBadge from "./alertTypeBadge";
import LoaderComp from "../loaderComp";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import PrimarySelect from "../form/primarySelect";
import { getVehicles, Vehicle } from "@/services/vehicles.service";

export default function AlertsTable({
  alerts,
  isLoading,
  filters,
  setFilters,
  onChange,
  isVehiclePage = false,
  vehicle,
}: {
  alerts: Alert[];
  isLoading: boolean;
  filters: AlertFilters;
  setFilters: (filters: Partial<AlertFilters>) => void;
  onChange: () => void;
  isVehiclePage?: boolean;
  vehicle?: Vehicle;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const activeFiltersCount =
    (filters.severity ? 1 : 0) +
    (filters.isRead !== undefined ? 1 : 0) +
    (filters.resolved !== undefined ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      search: "",
      severity: undefined,
      isRead: undefined,
      resolved: undefined,
    });
  };

  async function handleRead(id: string) {
    try {
      const alert = alerts.find((a) => a.id === id);

      if (alert?.isRead) {
        await markAlertUnread(id);
        toast.success("Alerta marcado como não lido");
      } else {
        await markAlertRead(id);
        toast.success("Alerta marcado como lido");
      }

      onChange();
    } catch {
      toast.error("Erro ao atualizar status de leitura do alerta");
    }
  }

  async function handleResolve(id: string) {
    try {
      await resolveAlert(id);
      toast.success("Alerta resolvido");
      onChange();
    } catch {
      toast.error("Erro ao resolver alerta");
    }
  }

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

    fetchVehicles();
  }, []);

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Bell size={26} />
          </div>

          <div>
            <h2 className="text-lg font-bold">Alertas</h2>

            {isVehiclePage && vehicle && (
              <div className="flex items-center gap-1 text-sm text-muted">
                <Car size={18} />
                <span className="font-bold">
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
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border grid grid-cols-[9fr_1fr] w-full gap-4 justify-between border">
          <div className="space-y-4">
            {/* SEARCH */}
            <div className="flex items-end gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
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
                placeholder="Buscar alerta..."
              />
            </div>
            <div className="flex items-center gap-4">
              {!isVehiclePage && (
                <PrimarySelect
                  searchable
                  label="Veículo"
                  value={filters.vehiclePlate || ""}
                  onChange={(val) =>
                    setFilters({
                      ...filters,
                      vehiclePlate: (val as string) || undefined,
                    })
                  }
                  options={[
                    { label: "Todos os veículos", value: "" },
                    ...vehicles.map((v) => ({
                      label: `${v.modelo} - ${v.placa}`,
                      value: v.placa,
                    })),
                  ]}
                  className="max-w-xs"
                />
              )}
              {/* SEVERITY */}
              <FilterChips
                label="Severidade"
                value={filters.severity || ""}
                onChange={(value) =>
                  setFilters({
                    severity: filters.severity === value ? undefined : value,
                  })
                }
                options={[
                  { label: "Info", value: "INFO" },
                  { label: "Aviso", value: "WARNING" },
                  { label: "Crítico", value: "CRITICAL" },
                ]}
              />
              {/* READ */}
              <FilterChips
                label="Leitura"
                value={
                  filters.isRead === undefined
                    ? ""
                    : filters.isRead
                      ? "true"
                      : "false"
                }
                onChange={(value) =>
                  setFilters({
                    isRead: value === "" ? undefined : value === "true",
                  })
                }
                options={[
                  { label: "Lidos", value: "true" },
                  { label: "Não lidos", value: "false" },
                ]}
              />
              {/* STATUS */}
              <FilterChips
                label="Status"
                value={
                  filters.resolved === undefined
                    ? ""
                    : filters.resolved
                      ? "true"
                      : "false"
                }
                onChange={(value) =>
                  setFilters({
                    resolved: value === "" ? undefined : value === "true",
                  })
                }
                options={[
                  { label: "Resolvidos", value: "true" },
                  { label: "Em aberto", value: "false" },
                ]}
              />
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40 w-fit self-end"
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
                <th className="px-6 py-4">Severidade</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Mensagem</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    Nenhum alerta encontrado
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className={`border-b border-border ${
                      !alert.isRead ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      {alert.sequenceId.toString().padStart(5, "0")}
                    </td>

                    <td className="px-6 py-4">
                      <AlertSeverityBadge severity={alert.severity} />
                    </td>

                    <td className="px-6 py-4">
                      <AlertTypeBadge type={alert.type} />
                    </td>

                    <td className="px-6 py-4">{alert.message}</td>

                    <td className="px-6 py-4 text-muted">
                      {dayjs(alert.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!alert.resolved && !alert.resolvedAt && (
                          <button
                            onClick={() => handleRead(alert.id)}
                            className="p-2 hover:text-accent"
                          >
                            {alert.isRead ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        )}

                        {!alert.resolved && !alert.resolvedAt && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="p-2 hover:text-success"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
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
