"use client";

import {
  getVehicles,
  Vehicle,
  VehicleFilters,
} from "@/services/vehicles.service";
import { VehicleTable } from "@/components/vehicles/vehiclesTable";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Truck, CarFront, FileWarning } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";

export default function VeiculosPage() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [filters, setFilters] = useState<VehicleFilters>({
    search: "",
    tipo: undefined,
    isActive: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVehicles({
        limit: 1000,
        page: 1,
      });

      setVehicles(data.vehicles);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const processedData = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !vehicle.placa.toLowerCase().includes(search) &&
          !vehicle.modelo.toLowerCase().includes(search) &&
          !vehicle.marca.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (filters.tipo) {
        if (!filters.tipo.includes(vehicle.tipo)) return false;
      }

      if (filters.isActive !== undefined) {
        if (vehicle.isActive !== filters.isActive) return false;
      }

      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      totalFiltered: filtered.length,
      total: vehicles.length,
    };
  }, [vehicles, filters, page]);

  const totalPages = Math.ceil(processedData.totalFiltered / limit);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Gerenciamento de <span className="text-accent">Veículos</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total"
              value={processedData.total.toString()}
              icon={<Truck />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Filtrados"
              value={processedData.totalFiltered.toString()}
              icon={<CarFront />}
              iconColor="text-info"
            />
            <StatsCard
              label="Páginas"
              value={totalPages.toString()}
              icon={<FileWarning />}
              iconColor="text-success"
            />
          </div>
        )}

        <VehicleTable
          vehicles={processedData.data}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onVehicleChange={fetchVehicles}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}