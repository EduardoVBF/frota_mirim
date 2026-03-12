import {
  AlertTriangle,
  Package,
  Wrench,
  Fuel,
  FileWarning,
  Car,
} from "lucide-react";

export default function AlertTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "LOW_STOCK":
    case "ZERO_STOCK":
      return <Package size={16} />;

    case "MAINTENANCE_DUE":
    case "MAINTENANCE_OVERDUE":
    case "MAINTENANCE_OPEN_TOO_LONG":
      return <Wrench size={16} />;

    case "VEHICLE_DOCUMENT_EXPIRING":
    case "VEHICLE_DOCUMENT_EXPIRED":
      return <FileWarning size={16} />;

    case "FUEL_CONSUMPTION_ANOMALY":
      return <Fuel size={16} />;

    case "VEHICLE_CHECKOUT_TOO_LONG":
      return <Car size={16} />;

    default:
      return <AlertTriangle size={16} />;
  }
}
