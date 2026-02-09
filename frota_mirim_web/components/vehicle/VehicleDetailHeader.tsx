"use client";
import { Edit3, AlertTriangle, ArrowLeft, Fuel, Calendar, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";

export function VehicleDetailHeader() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Botão Voltar e Ações */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para frota
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-full text-xs font-bold">
            <AlertTriangle size={14} /> 2 Alertas Pendentes
          </div>
          <button className="p-2 rounded-xl bg-alternative-bg border border-border hover:border-accent/50 text-muted hover:text-accent transition-all">
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Título e Modelo */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
          Opala - <span className="text-accent">BSR-9B03</span>
        </h1>
        <p className="text-muted font-medium">Ferrari, 1900 • <span className="text-success">Em operação</span></p>
      </div>

      {/* Cards de Telemetria Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TelemetriaCard icon={<Gauge />} label="Quilometragem" value="470.347 km" />
        <TelemetriaCard icon={<Calendar />} label="Próxima Revisão" value="20.000 km" />
        <TelemetriaCard icon={<Fuel />} label="Consumo Médio" value="0.31 Km/L" highlight />
        <TelemetriaCard icon={<Fuel />} label="Motorista" value="Bruno Jklkl" />
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

function TelemetriaCard({ icon, label, value, highlight = false }: TelemetriaCardProps) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-accent border-accent shadow-lg shadow-accent/20' : 'bg-alternative-bg border-border'}`}>
      <div className={`flex items-center gap-2 mb-2 ${highlight ? 'text-white/70' : 'text-muted'}`}>
        {icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-xl font-bold ${highlight ? 'text-white' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}