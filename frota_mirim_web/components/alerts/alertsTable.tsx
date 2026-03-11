"use client";
import {
  Alert,
  AlertFilters,
  markAlertUnread,
} from "@/services/alerts.service";
import {
  Filter,
  FilterX,
  Search,
  Eye,
  Check,
  Bell,
  EyeOff,
} from "lucide-react";

import FilterChips from "../fuel-supply/FilterChips";
import LoaderComp from "../loaderComp";

import AlertSeverityBadge from "./alertSeverityBadge";
import AlertTypeBadge from "./alertTypeBadge";

import { markAlertRead, resolveAlert } from "@/services/alerts.service";

import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useState } from "react";

export default function AlertsTable({
  alerts,
  isLoading,
  filters,
  setFilters,
  onChange,
}: {
  alerts: Alert[];
  isLoading: boolean;
  filters: AlertFilters;
  setFilters: (filters: Partial<AlertFilters>) => void;
  onChange: () => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

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
      if (alerts.find((a) => a.id === id)?.isRead) {
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

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Bell size={26} />
          </div>

          <h2 className="text-lg font-bold">Alertas</h2>
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
        <div className="px-6 py-4 border-b border-border flex items-end gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
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

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40"
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
                            title={`Marcar como ${alert.isRead ? "não lido" : "lido"}`}
                          >
                            {alert.isRead ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        )}

                        {!alert.resolvedAt && !alert.resolved && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="p-2 hover:text-success"
                            title="Marcar como resolvido"
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
