"use client";
import { Alert, markAlertRead, resolveAlert } from "@/services/alerts.service";
import { Check, Eye, Bell, Filter, FilterX, Search } from "lucide-react";
import AlertSeverityBadge from "./alertSeverityBadge";
import FilterChips from "../fuel-supply/FilterChips";
import AlertTypeBadge from "./alertTypeBadge";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function AlertsTable({
  alerts,
  onChange,
}: {
  alerts: Alert[];
  onChange: () => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);

  async function handleRead(id: string) {
    try {
      await markAlertRead(id);
      onChange();
    } catch {
      toast.error("Erro ao marcar alerta como lido");
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

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      if (search && !alert.message.toLowerCase().includes(search.toLowerCase()))
        return false;

      if (severity && alert.severity !== severity) return false;

      if (onlyUnread && alert.isRead) return false;

      return true;
    });
  }, [alerts, search, severity, onlyUnread]);

  const activeFilters =
    (search ? 1 : 0) + (severity ? 1 : 0) + (onlyUnread ? 1 : 0);

  function clearFilters() {
    setSearch("");
    setSeverity("");
    setOnlyUnread(false);
  }

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Bell size={22} />
          </div>

          <h2 className="text-lg font-bold">Alertas do sistema</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg"
          >
            {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
            Filtros
          </button>

          {activeFilters > 0 && (
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
              {activeFilters} filtro(s)
            </span>
          )}
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border flex gap-4 items-end">
          {/* SEARCH */}
          <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
            <Search size={18} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full text-sm focus:outline-none"
              placeholder="Buscar alerta..."
            />
          </div>

          {/* SEVERITY */}
          <FilterChips
            label="Severidade"
            options={[
              { label: "Informativo", value: "INFO" },
              { label: "Aviso", value: "WARNING" },
              { label: "Crítico", value: "CRITICAL" },
            ]}
            value={severity ? [severity] : []}
            onChange={(values) => setSeverity(values[0] || "")}
          />

          {/* UNREAD */}
          <FilterChips
            label="Não lidos"
            options={[
              { label: "Não lidos", value: "UNREAD" },
              { label: "Lidos", value: "READ" },
            ]}
            value={onlyUnread ? ["UNREAD"] : []}
            onChange={(values) => setOnlyUnread(values.includes("UNREAD"))}
          />

          {activeFilters > 0 && (
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
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-muted border-b border-border">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Severidade</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Mensagem</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  Nenhum alerta encontrado
                </td>
              </tr>
            ) : (
              filtered.map((alert) => (
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
                      {!alert.isRead && (
                        <button
                          onClick={() => handleRead(alert.id)}
                          className="p-2 hover:text-accent"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      {!alert.resolved && (
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
    </div>
  );
}
