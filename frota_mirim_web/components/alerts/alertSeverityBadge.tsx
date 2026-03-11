"use client";
import { AlertCircle, AlertTriangle, Bell } from "lucide-react";
import { AlertSeverity } from "@/services/alerts.service";

export default function AlertSeverityBadge({
  severity,
}: {
  severity: AlertSeverity;
}) {
  const config = {
    INFO: {
      colors: "bg-info/70 text-white",
      icon: Bell,
      label: "Informação",
    },
    WARNING: {
      colors: "bg-warning/70 text-white",
      icon: AlertTriangle,
      label: "Aviso",
    },
    CRITICAL: {
      colors: "bg-error/70 text-white",
      icon: AlertCircle,
      label: "Crítico",
    },
  }[severity];

  const Icon = config.icon;

  return (
    <div
      className={`px-2 py-1 text-xs rounded-md font-medium flex items-center gap-1 ${config.colors}`}
      title={config.label}
    >
      <Icon size={12} />
      {config.label}
    </div>
  );
}
