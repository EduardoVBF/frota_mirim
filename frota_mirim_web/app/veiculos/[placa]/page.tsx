"use client";
import { VehicleDetailHeader } from "@/components/vehicle/VehicleDetailHeader";
import { getFuelSupplies, FuelSupply } from "@/services/fuel-supply.service";
import { getVehicleByPlaca, Vehicle } from "@/services/vehicles.service";
import { FuelHistoryTable } from "@/components/vehicle/FuelHistoryTable";
import { PageTransition } from "@/components/motion/pageTransition";
import { useEffect, useState, useCallback } from "react";
import LoaderComp from "@/components/loaderComp";
import { useParams } from "next/navigation";

export default function VeiculoUnicoPage() {
  const params = useParams();
  const placa = params.placa as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [abastecimentos, setAbastecimentos] = useState<FuelSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const limit = 2;

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