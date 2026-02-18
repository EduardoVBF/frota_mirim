"use client";

import {
  Edit3,
  AlertTriangle,
  ArrowLeft,
  Fuel,
  Calendar,
  Gauge,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/services/vehicles.service";

type Props = {
  vehicle: Vehicle;
};

export function VehicleDetailHeader({ vehicle }: Props) {
  const router = useRouter();

  const today = new Date();
  const docExpired = new Date(vehicle.vencimentoDocumento) < today;
  const ipvaExpired = new Date(vehicle.vencimentoIPVA) < today;

  const alertCount =
    (docExpired ? 1 : 0) + (ipvaExpired ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para frota
        </button>

        <div className="flex items-center gap-3">
          {alertCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-full text-xs font-bold">
              <AlertTriangle size={14} /> {alertCount} alerta(s)
            </div>
          )}

          <button className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition-all">
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
          {vehicle.modelo} -{" "}
          <span className="text-accent">{vehicle.placa}</span>
        </h1>
        <p className="text-muted font-medium">
          {vehicle.marca}, {vehicle.ano} •{" "}
          <span
            className={
              vehicle.isActive ? "text-success" : "text-error"
            }
          >
            {vehicle.isActive ? "Em operação" : "Inativo"}
          </span>
        </p>
      </div>

      {/* Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TelemetriaCard
          icon={<Gauge />}
          label="Quilometragem"
          value={`${vehicle.kmAtual.toLocaleString()} km`}
        />

        <TelemetriaCard
          icon={<Calendar />}
          label="Documento"
          value={new Date(
            vehicle.vencimentoDocumento
          ).toLocaleDateString("pt-BR")}
          highlight={docExpired}
        />

        <TelemetriaCard
          icon={<Calendar />}
          label="IPVA"
          value={new Date(
            vehicle.vencimentoIPVA
          ).toLocaleDateString("pt-BR")}
          highlight={ipvaExpired}
        />

        <TelemetriaCard
          icon={<Fuel />}
          label="Último Abastecimento"
          value={
            vehicle.kmUltimoAbastecimento
              ? `${vehicle.kmUltimoAbastecimento.toLocaleString()} km`
              : "—"
          }
        />
      </div>
    </div>
  );
}

type TelemetriaCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
};

function TelemetriaCard({
  icon,
  label,
  value,
  highlight = false,
}: TelemetriaCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        highlight
          ? "bg-error border-error/40 text-white shadow-lg shadow-error/20"
          : "bg-alternative-bg border-border"
      }`}
    >
      <div
        className={`flex items-center gap-2 mb-2 ${
          highlight ? "text-white/70" : "text-muted"
        }`}
      >
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>

      <div
        className={`text-xl font-bold ${
          highlight ? "text-white" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
