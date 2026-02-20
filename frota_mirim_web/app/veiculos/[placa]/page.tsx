"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { getVehicleByPlaca, Vehicle } from "@/services/vehicles.service";
import { getFuelSupplies, FuelSupply } from "@/services/fuel-supply.service";

import { VehicleDetailHeader } from "@/components/vehicle/VehicleDetailHeader";
import { FuelHistoryTable } from "@/components/vehicle/FuelHistoryTable";
import { PageTransition } from "@/components/motion/pageTransition";
import LoaderComp from "@/components/loaderComp";

export default function VeiculoUnicoPage() {
  const params = useParams();
  const placa = params.placa as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [abastecimentos, setAbastecimentos] = useState<FuelSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const limit = 10;

  // FETCH VEÍCULO
  const fetchVehicle = useCallback(async () => {
    try {
      const data = await getVehicleByPlaca(placa);
      setVehicle(data);
      return data;
    } catch {
      setVehicle(null);
    }
  }, [placa]);

  // FETCH TODOS ABASTECIMENTOS (SEM PAGINAÇÃO)
  const fetchFuelHistory = useCallback(async (vehicleId: string) => {
    try {
      const data = await getFuelSupplies({
        vehicleId,
        limit: 1000,
        page: 1,
      });

      setAbastecimentos(data.abastecimentos);
    } catch {
      setAbastecimentos([]);
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const v = await fetchVehicle();

      if (v) {
        await fetchFuelHistory(v.id);
      }

      setLoading(false);
    }

    load();
  }, [fetchVehicle, fetchFuelHistory]);

  const refreshAll = async () => {
    if (!vehicle) return;
    await fetchFuelHistory(vehicle.id);
  };

  if (loading) return <LoaderComp />;

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-muted">
        Veículo não encontrado.
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto pb-20">
        <VehicleDetailHeader vehicle={vehicle} onVehicleChange={fetchVehicle} />

        <div className="mt-8 p-8 rounded-2xl bg-linear-to-br from-alternative-bg to-background border border-border h-48 flex items-center justify-center border-dashed">
          <span className="text-muted text-sm font-medium">
            Gráfico de Performance (placeholder)
          </span>
        </div>

        <FuelHistoryTable
          vehicle={vehicle}
          abastecimentos={abastecimentos}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onChange={refreshAll}
        />
      </div>
    </PageTransition>
  );
}