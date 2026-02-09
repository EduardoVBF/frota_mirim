import { VehicleDetailHeader } from "@/components/vehicle/VehicleDetailHeader";
import { FuelHistoryTable } from "@/components/vehicle/FuelHistoryTable";
import { PageTransition } from "@/components/motion/pageTransition";

export default function VeiculoUnicoPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto pb-20">
        <VehicleDetailHeader />
        
        {/* Espaço para um gráfico futuro de consumo */}
        <div className="mt-8 p-8 rounded-2xl bg-linear-to-br from-alternative-bg to-background border border-border h-48 flex items-center justify-center border-dashed">
            <span className="text-muted text-sm font-medium">Gráfico de Performance (Framer Motion Chart placeholder)</span>
        </div>

        <FuelHistoryTable />
      </div>
    </PageTransition>
  );
}