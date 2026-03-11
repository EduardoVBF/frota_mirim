"use client";
import { AlertType } from "@/services/alerts.service";

export default function AlertTypeBadge({ type }: { type: AlertType }) {
  const labels: Record<AlertType, string> = {
    LOW_STOCK: "Estoque baixo",
    ZERO_STOCK: "Sem estoque",

    MAINTENANCE_DUE: "Manutenção próxima",
    MAINTENANCE_OVERDUE: "Manutenção atrasada",
    MAINTENANCE_OPEN_TOO_LONG: "Manutenção aberta muito tempo",
    MAINTENANCE_IN_PROGRESS_TOO_LONG: "Manutenção em andamento muito tempo",

    VEHICLE_DOCUMENT_EXPIRING: "Documento vencendo",
    VEHICLE_DOCUMENT_EXPIRED: "Documento vencido",

    FUEL_CONSUMPTION_ANOMALY: "Consumo anormal",

    VEHICLE_CHECKOUT_TOO_LONG: "Veículo fora muito tempo",
  };

  return (
    <span className="text-xs px-2 py-1 bg-accent text-white rounded-md">
      {labels[type]}
    </span>
  );
}
