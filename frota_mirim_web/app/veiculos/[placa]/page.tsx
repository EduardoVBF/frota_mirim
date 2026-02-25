"use client";
import { VehicleDetailHeader } from "@/components/vehicle/VehicleDetailHeader";
import { getVehicleByPlaca, Vehicle } from "@/services/vehicles.service";
import { PageTransition } from "@/components/motion/pageTransition";
import VehicleTabs from "@/components/vehicle/VehicleTabs";
import { useEffect, useState, useCallback } from "react";
import LoaderComp from "@/components/loaderComp";
import { useParams } from "next/navigation";

export default function VeiculoUnicoPage() {
  const params = useParams();
  const placa = params.placa as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicle = useCallback(async () => {
    try {
      const data = await getVehicleByPlaca(placa);
      setVehicle(data);
      return data;
    } catch {
      setVehicle(null);
    }
  }, [placa]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchVehicle();
      setLoading(false);
    }

    load();
  }, [fetchVehicle]);

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
      <div className="max-w-7xl mx-auto pb-20 space-y-6">
        <VehicleDetailHeader
          vehicle={vehicle}
          onVehicleChange={fetchVehicle}
        />

        <VehicleTabs vehicle={vehicle} />
      </div>
    </PageTransition>
  );
}