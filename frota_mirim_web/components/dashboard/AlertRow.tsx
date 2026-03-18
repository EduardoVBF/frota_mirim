"use client";
export default function AlertRow({
  message,
  severity,
  sequenceId,
}: {
  message: string;
  severity: string;
  sequenceId: number;
}) {
  const color =
    severity === "CRÍTICO"
      ? "text-red-500"
      : severity === "AVISO"
        ? "text-yellow-500"
        : "text-muted";

  return (
    <div className="flex justify-between px-4 py-3 text-sm hover:bg-muted/30 transition">
      <div className="space-x-2">
        <span>#{sequenceId}</span>
        <span>{message}</span>
      </div>
      <span className={`text-xs font-semibold ${color}`}>{severity}</span>
    </div>
  );
}
