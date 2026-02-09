import { PageTransition } from "@/components/motion/pageTransition";
import { VehicleTable } from "@/components/vehicles/vehiclesTable";
import { StatsCard } from "@/components/statsCard";
import { Truck } from "lucide-react";

export default function VeiculosPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-foreground">
              Controle de <span className="text-accent">Frota</span>
            </h1>
            <p className="text-muted text-sm mt-1">
              Monitore a disponibilidade, documentação e motoristas de cada
              unidade.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6 my-3">
          <StatsCard
            label="Total de Veículos"
            value="3"
            icon={<Truck />}
            iconColor="text-accent"
          />

          <StatsCard
            label="Veículos Ativos"
            value="3"
            icon={<Truck />}
            iconColor="text-success"
          />

          <StatsCard
            label="Veículos Inativos"
            value="0"
            icon={<Truck />}
            iconColor="text-muted"
          />
        </div>

        <VehicleTable />
      </div>
    </PageTransition>
  );
}
