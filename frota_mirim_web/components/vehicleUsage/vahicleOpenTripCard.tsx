"use client";

import { VehicleUsage } from "@/services/vehicleUsage.service";
import { User } from "@/services/users.service";
import { PlayCircle } from "lucide-react";

type Props = {
  openTrip: VehicleUsage;
  users: User[];
};

export default function VehicleOpenTripCard({ openTrip, users }: Props) {
  const driver = users.find((u) => u.id === openTrip.userId);
  const assistant = users.find((u) => u.id === openTrip.assistantId);

  const startDate = new Date(openTrip.createdAt);

  const duration = (() => {
    const now = new Date().getTime();
    const diffMs = now - startDate.getTime();

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours}h`;

    return `${hours}h ${minutes}min`;
  })();

  return (
    <div className="rounded-2xl border border-warning bg-warning/5 p-6 space-y-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-warning/10 text-warning">
            <PlayCircle size={18} />
          </div>

          <div>
            <h3 className="text-lg font-semibold leading-none">
              Viagem em andamento
            </h3>
            <span className="text-xs text-muted-foreground">
              O veículo está atualmente em uso
            </span>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-warning/10 text-warning font-medium">
          Em andamento
        </span>
      </div>

      {/* INFO */}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1 text-muted-foreground">
          <span>
            👤 Motorista:{" "}
            <span className="text-foreground font-medium">
              {driver
                ? `${driver.firstName} ${driver.lastName}`
                : "Desconhecido"}
            </span>
          </span>

          {assistant && (
            <span>
              🧑‍🔧 Auxiliar:{" "}
              <span className="text-foreground font-medium">
                {assistant.firstName} {assistant.lastName}
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-muted-foreground">
          <span>
            🕒 Início:{" "}
            <span className="text-foreground font-medium">
              {startDate.toLocaleString("pt-BR")}
            </span>
          </span>

          <span>
            ⏱️ Duração atual:{" "}
            <span className="text-foreground font-medium">{duration}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
