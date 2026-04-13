import { api } from "./api";

/* TYPES */
export type MaintenanceHistoryAction =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "ITEM_ADDED"
  | "ITEM_REMOVED"
  | "ITEM_UPDATED"
  | "ATTACHMENT_ADDED"
  | "ATTACHMENT_REMOVED"
  | "RESPONSIBLE_CHANGED";

export type MaintenanceHistoryChange = {
  field: string;
  label: string;
  from: unknown;
  to: unknown;
};

export type MaintenanceHistoryMetadata = {
  changes?: MaintenanceHistoryChange[];
  context?: Record<string, unknown>;
};

export type MaintenanceHistory = {
  id: string;

  maintenanceOrderId: string;

  action: MaintenanceHistoryAction;

  actorUserId?: string | null;
  responsibleUserId?: string | null;

  actorUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  responsibleUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  metadata?: MaintenanceHistoryMetadata;

  description?: string | null;

  createdAt: string;
};

/* QUERY / RESPONSE */
export type GetMaintenanceHistoryParams = {
  maintenanceOrderId: string;
  action?: MaintenanceHistoryAction;
  page?: number;
  limit?: number;
};

export type MaintenanceHistoryResponse = {
  history: MaintenanceHistory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

/* API CALLS */

// GET ALL
export async function getMaintenanceHistory(
  params: GetMaintenanceHistoryParams,
): Promise<MaintenanceHistoryResponse> {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>),
  ).toString();

  const { data } = await api.get(`/maintenance-history?${query}`);

  return data;
}

// UPDATE RESPONSIBLE
export async function updateMaintenanceHistoryResponsible(
  id: string,
  responsibleUserId: string,
): Promise<MaintenanceHistory> {
  const { data } = await api.patch(
    `/maintenance-history/${id}/responsible`,
    {
      responsibleUserId,
    },
  );

  return data;
}

/* HELPERS (UI) */

// Nome do usuário
export function getHistoryUserName(history: MaintenanceHistory) {
  if (!history.actorUser) return "Sistema";

  return `${history.actorUser.firstName} ${history.actorUser.lastName}`;
}

// Traduz ação
export function translateHistoryAction(action: MaintenanceHistoryAction) {
  switch (action) {
    case "CREATED":
      return "Criação da manutenção";
    case "UPDATED":
      return "Edição";
    case "STATUS_CHANGED":
      return "Alteração de status";
    case "ITEM_ADDED":
      return "Item adicionado";
    case "ITEM_REMOVED":
      return "Item removido";
    case "ITEM_UPDATED":
      return "Item atualizado";
    case "ATTACHMENT_ADDED":
      return "Anexo adicionado";
    case "ATTACHMENT_REMOVED":
      return "Anexo removido";
    case "RESPONSIBLE_CHANGED":
      return "Responsável alterado";
    default:
      return action;
  }
}

// Traduz valores comuns
export function translateValue(field: string, value: unknown) {
  if (value === null || value === undefined) return "-";

  // STATUS
  if (field === "status" && typeof value === "string") {
    const map: Record<string, string> = {
      OPEN: "Aberta",
      IN_PROGRESS: "Em andamento",
      DONE: "Concluída",
      CANCELED: "Cancelada",
    };

    return map[value] ?? value;
  }

  // BOOLEAN
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  // NUMBER (ex: dinheiro / quantidade)
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR");
  }

  // STRING
  if (typeof value === "string") {
    return value;
  }

  // FALLBACK
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}