"use client";
import { VehicleTrip } from "@/services/vehicleUsage.service";
import { User } from "@/services/users.service";
import { ClockCheck } from "lucide-react";

type Props = {
  lastTrip: VehicleTrip;
  users: User[];
};

export default function VehicleLastTripCard({ lastTrip, users }: Props) {
  const driver = users.find((u) => u.id === lastTrip.trip.userId);
  const assistant = users.find((u) => u.id === lastTrip.trip.assistantId);

  const duration = lastTrip.trip.finishedAt
    ? (() => {
        const diffMs =
          new Date(lastTrip.trip.finishedAt).getTime() -
          new Date(lastTrip.trip.startedAt).getTime();

        const totalMinutes = Math.floor(diffMs / 60000);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) return `${minutes} min`;
        if (minutes === 0) return `${hours}h`;

        return `${hours}h ${minutes}min`;
      })()
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/10 text-accent">
          <ClockCheck size={18} />
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-none">
            Última Viagem Completa
          </h3>
        </div>
      </div>

      {/* INFO */}
      <div className="flex gap-6 text-sm">
        <div className="flex flex-col gap-1 text-muted-foreground">
          <span>
            👤 Motorista:{" "}
            <span className="text-foreground font-medium">
              {driver
                ? `${driver.firstName} ${driver.lastName}`
                : "Desconhecido"}
            </span>
          </span>

          <span>
            👤 Auxiliar:{" "}
            <span className="text-foreground font-medium">
              {assistant
                ? `${assistant.firstName} ${assistant.lastName}`
                : "-"}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1 text-muted-foreground">
          <span>
            🕒 Início:{" "}
            <span className="text-foreground font-medium">
              {new Date(lastTrip.trip.startedAt).toLocaleString("pt-BR")}
            </span>
          </span>

          {lastTrip.trip.finishedAt && (
            <span>
              🏁 Fim:{" "}
              <span className="text-foreground font-medium">
                {new Date(lastTrip.trip.finishedAt).toLocaleString("pt-BR")}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-muted/40 p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">KM Rodados</span>
          <span className="text-2xl font-bold">
            {lastTrip.trip.kmDriven ?? 0} Km
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">KM Inicial</span>
          <span className="text-2xl font-bold">{lastTrip.trip.kmStart} Km</span>
        </div>

        <div className="rounded-xl bg-muted/40 p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">KM Final</span>
          <span className="text-2xl font-bold">
            {lastTrip.trip.kmEnd ?? "-"} Km
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">Duração</span>
          <span className="text-2xl font-bold">
            {duration ? `${duration}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
