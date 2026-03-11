"use client";
import { AlertSeverity } from "@/services/alerts.service";

export default function AlertSeverityBadge({
  severity,
}: {
  severity: AlertSeverity;
}) {
  const map = {
    INFO: "bg-blue-100 text-blue-700",
    WARNING: "bg-yellow-100 text-yellow-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md font-medium ${map[severity]}`}
    >
      {severity}
    </span>
  );
}
