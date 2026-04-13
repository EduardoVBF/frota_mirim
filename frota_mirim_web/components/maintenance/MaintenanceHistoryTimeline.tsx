"use client";
import {
  getMaintenanceHistory,
  MaintenanceHistoryMetadata,
  MaintenanceHistoryChange,
  MaintenanceHistory,
} from "@/services/maintenanceHistory.service";
import ChangeMaintenanceResponsibleModal from "./ChangeMaintenanceResponsibleModal";
import { Clock, User, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import LoaderComp from "../loaderComp";
import DOMPurify from "dompurify";
import dayjs from "dayjs";

type HistoryItem = {
  id: string;
  action: string;
  actorUser?: {
    firstName: string;
    lastName: string;
  };
  responsibleUser?: {
    firstName: string;
    lastName: string;
  };
  metadata?: MaintenanceHistoryMetadata;
  createdAt: string;
};

export function MaintenanceHistoryTimeline({
  maintenanceId,
}: {
  maintenanceId: string;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] =
    useState<MaintenanceHistory | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const data = await getMaintenanceHistory({
        maintenanceOrderId: maintenanceId,
      });

      setHistory(data.history);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceId]);

  /* HELPERS */
  const getUserName = (user?: { firstName: string; lastName: string }) => {
    if (!user) return "-";
    return `${user.firstName} ${user.lastName}`;
  };

  const translateAction = (action: string) => {
    const map: Record<string, string> = {
      CREATED: "Criação da manutenção",
      UPDATED: "Edição",
      STATUS_CHANGED: "Alteração de status",
      ITEM_ADDED: "Item adicionado",
      ITEM_REMOVED: "Item removido",
      ITEM_UPDATED: "Item atualizado",
      ATTACHMENT_ADDED: "Anexo adicionado",
      ATTACHMENT_REMOVED: "Anexo removido",
      RESPONSIBLE_CHANGED: "Responsável alterado",
    };

    return map[action] ?? action;
  };

  const getActionColor = (action: string) => {
    if (action.includes("ADDED")) return "text-green-600";
    if (action.includes("REMOVED")) return "text-red-600";
    if (action.includes("UPDATED")) return "text-yellow-600";
    if (action.includes("STATUS")) return "text-blue-600";
    return "text-accent";
  };

  const translateField = (field: string) => {
    const map: Record<string, string> = {
      status: "Status",
      title: "Título",
      description: "Descrição",
      quantity: "Quantidade",
      unitPrice: "Preço unitário",
      totalPrice: "Total",
      blocksVehicle: "Bloqueia veículo",
      odometer: "Odômetro (KM)",
      type: "Tipo",
      performerType: "Local",
    };

    return map[field] ?? field;
  };

  const translateContextKey = (key: string) => {
    const map: Record<string, string> = {
      name: "Nome",
      fileName: "Arquivo",
      mimeType: "Tipo",
      quantity: "Quantidade",
      unitPrice: "Preço",
      type: "Tipo",
      title: "Título",
      odometer: "Odômetro (KM)",
    };

    return map[key] ?? key;
  };

  const translateStatus = (value: string) => {
    const map: Record<string, string> = {
      OPEN: "Aberta",
      IN_PROGRESS: "Em andamento",
      DONE: "Concluída",
      CANCELED: "Cancelada",
    };

    return map[value] ?? value;
  };

  const formatValue = (
    field: string,
    value: string | number | boolean | null | undefined,
  ) => {
    if (value === null || value === undefined) return "-";

    if (field === "status") return translateStatus(value as string);

    if (field === "type") {
      const typeMap: Record<string, string> = {
        PREVENTIVE: "Preventiva",
        CORRECTIVE: "Corretiva",
        INSPECTION: "Inspeção",
        PART: "Peça",
        SERVICE: "Serviço",
      };
      return typeMap[value as string] ?? value;
    }

    if (field === "performerType") {
      const performerMap: Record<string, string> = {
        INTERNAL: "Interno",
        EXTERNAL: "Externo",
      };
      return performerMap[value as string] ?? value;
    }

    if (typeof value === "boolean") return value ? "Sim" : "Não";

    if (typeof value === "number") return value.toLocaleString("pt-BR");

    return String(value);
  };

  /* RENDER CHANGES */
  const renderChanges = (metadata: MaintenanceHistoryMetadata) => {
    if (!metadata?.changes) return null;

    return (
      <div className="mt-2 space-y-2">
        {metadata.changes.map(
          (change: MaintenanceHistoryChange, index: number) => {
            const isHtml = change.field === "description";

            return (
              <div key={index} className="text-xs text-muted">
                <span className="font-medium">
                  {translateField(change.field)}:
                </span>

                {isHtml ? (
                  <div className="mt-2 space-y-2">
                    <div
                      className="prose prose-sm line-through opacity-70 bg-background border border-border rounded-xl p-3"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          (change.from as string) || "-",
                        ),
                      }}
                    />
                    <div
                      className="prose prose-sm bg-background border border-border rounded-xl p-3"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          (change.to as string) || "-",
                        ),
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <span className="line-through opacity-70 ml-1">
                      {formatValue(
                        change.field,
                        change.from as string | number | boolean,
                      )}
                    </span>{" "}
                    →{" "}
                    <span className="font-semibold">
                      {formatValue(
                        change.field,
                        change.to as string | number | boolean,
                      )}
                    </span>
                  </>
                )}
              </div>
            );
          },
        )}
      </div>
    );
  };

  /* RENDER CONTEXT */
  const renderContext = (metadata: MaintenanceHistoryMetadata) => {
    if (!metadata?.context) return null;

    return (
      <div className="mt-2 text-xs text-muted space-y-1">
        {Object.entries(metadata.context).map(([key, value]) => {
          if (key.toLowerCase().includes("id")) return null;

          return (
            <div key={key}>
              <span className="font-medium">{translateContextKey(key)}:</span>{" "}
              {formatValue(key, value as string | number | boolean)}
            </div>
          );
        })}
      </div>
    );
  };

  /* RENDER GERAL */
  return (
    <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <ChangeMaintenanceResponsibleModal
        open={isModalOpen}
        history={selectedHistory!}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHistory(null);
        }}
        onSuccess={fetchHistory}
      />

      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="p-2 bg-accent/10 rounded-lg text-accent">
          <Clock size={20} />
        </div>

        <h2 className="text-lg font-bold">Histórico da manutenção</h2>
      </div>

      {loading ? (
        <div className="p-6">
          <LoaderComp />
        </div>
      ) : history.length === 0 ? (
        <div className="p-6 text-center text-muted">
          Nenhum histórico encontrado
        </div>
      ) : (
        <div className="p-6 space-y-6 overflow-auto max-h-150">
          {history.map((item, index) => (
            <div key={item.id} className="relative pl-6">
              {/* Linha */}
              {index !== history.length - 1 && (
                <div className="absolute left-1.75 top-7 bottom-0 w-0.5 bg-border" />
              )}

              {/* Bolinha */}
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-accent animate-pulse" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {/* USUÁRIO */}
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    {getUserName(item.actorUser)}
                  </div>
                  <p>-</p>
                  {/* ACTION */}
                  <div className={`${getActionColor(item.action)}`}>
                    {translateAction(item.action)}
                  </div>
                </div>

                {/* DATA */}
                <div className="text-xs text-muted">
                  {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>

                {/* RESPONSÁVEL */}
                <div className="flex items-center gap-2 text-xs text-muted">
                  Responsável:
                  <span className="font-medium">
                    {getUserName(item.responsibleUser)}
                  </span>
                  <button
                    className="p-1 hover:text-accent"
                    onClick={() => {
                      setSelectedHistory(item as MaintenanceHistory);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                </div>

                {/* CHANGES */}
                {renderChanges(item.metadata || {})}

                {/* CONTEXT */}
                {renderContext(item.metadata || {})}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
