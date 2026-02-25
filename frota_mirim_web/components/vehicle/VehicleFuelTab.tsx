"use client";
import { getFuelSupplies, FuelSupply } from "@/services/fuel-supply.service";
import { FuelHistoryTable } from "@/components/vehicle/FuelHistoryTable";
import { useEffect, useState, useCallback } from "react";
import { Vehicle } from "@/services/vehicles.service";
import Pagination from "@/components/paginationComp";
import LoaderComp from "@/components/loaderComp";

type Props = {
  vehicle: Vehicle;
};

export default function VehicleFuelTab({ vehicle }: Props) {
  const [abastecimentos, setAbastecimentos] = useState<FuelSupply[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const limit = 5;

  const fetchFuelHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFuelSupplies({
        vehicleId: vehicle.id,
        page,
        limit,
      });

      setTotalPages(data.meta.totalPages);
      setAbastecimentos(data.abastecimentos);
    } catch {
      setAbastecimentos([]);
    } finally {
      setLoading(false);
    }
  }, [vehicle.id, page]);

  useEffect(() => {
    setPage(1);
  }, [vehicle.id]);

  useEffect(() => {
    fetchFuelHistory();
  }, [fetchFuelHistory]);

  return (
    <div className="space-y-6">
      {loading && <LoaderComp />}

      <FuelHistoryTable
        vehicle={vehicle}
        abastecimentos={abastecimentos}
        onChange={fetchFuelHistory}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}