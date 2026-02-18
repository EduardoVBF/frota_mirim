"use client";

import {
  getVehicles,
  Vehicle,
  VehicleFilters,
} from "@/services/vehicles.service";
import { VehicleTable } from "@/components/vehicles/vehiclesTable";
import { Truck, CarFront, FileWarning } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
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
  const limit = 5;

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    totalPages: 1,
  });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getVehicles({
        ...filters,
        page,
        limit,
      });

      setVehicles(data.vehicles);
      setMeta(data.meta);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
              value={meta.total.toString()}
              icon={<Truck />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Filtrados"
              value={meta.totalFiltered.toString()}
              icon={<CarFront />}
              iconColor="text-info"
            />
            <StatsCard
              label="Páginas"
              value={meta.totalPages.toString()}
              icon={<FileWarning />}
              iconColor="text-success"
            />
          </div>
        )}

        <VehicleTable
          vehicles={vehicles}
          isLoading={loading}
          filters={filters}
          setFilters={(newFilters) => {
            setPage(1);
            setFilters(newFilters);
          }}
          onVehicleChange={fetchVehicles}
        />

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}
