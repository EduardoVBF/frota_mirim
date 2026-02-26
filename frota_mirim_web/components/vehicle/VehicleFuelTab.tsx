"use client";
import { getFuelSupplies, FuelSupply, FuelSupplyFilters } from "@/services/fuel-supply.service";
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

  const [filters, setFilters] = useState<FuelSupplyFilters>({
    vehicleId: vehicle.id,
    page: 1,
    limit: 10,
    tipoCombustivel: undefined,
    postoTipo: undefined,
    tanqueCheio: undefined,
    dataInicio: undefined,
    dataFim: undefined,
  });

  const fetchFuelHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFuelSupplies(filters);
      setTotalPages(data.meta.totalPages || 1);
      setAbastecimentos(data.abastecimentos);
    } catch {
      setAbastecimentos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFuelHistory();
  }, [fetchFuelHistory]);

  const handleSetFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset ao filtrar
    }));
  };

  if (loading && filters.page === 1) return <LoaderComp />;

  return (
    <div className="space-y-6">
      <FuelHistoryTable
        vehicle={vehicle}
        abastecimentos={abastecimentos}
        isLoading={loading}
        filters={filters}
        setFilters={handleSetFilters}
        onChange={fetchFuelHistory}
      />
      <Pagination
        page={filters.page || 1}
        totalPages={totalPages}
        onPageChange={(newPage) =>
          setFilters((prev) => ({ ...prev, page: newPage }))
        }
      />
    </div>
  );
}