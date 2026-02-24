"use client";
import {
  getUserPhones,
  UserPhone,
  UserPhoneFilters,
} from "@/services/usersTelephones.service";
import { UserPhoneTable } from "@/components/usersTelephones/userTelephonesTable";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Phone, Users, Layers } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";

export default function TelefonesPage() {
  const [loading, setLoading] = useState(false);
  const [phones, setPhones] = useState<UserPhone[]>([]);

  const [filters, setFilters] = useState<
    UserPhoneFilters & {
      search?: string;
      isPrimary?: boolean;
    }
  >({
    userId: undefined,
    isActive: undefined,
    search: "",
    isPrimary: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserPhones({
        limit: 1000,
        page: 1,
      });

      setPhones(data.phones);
    } catch {
      setPhones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const processedData = useMemo(() => {
    const filtered = phones.filter((phone) => {
      if (filters.userId && phone.userId !== filters.userId)
        return false;

      if (filters.isActive !== undefined) {
        if (phone.isActive !== filters.isActive)
          return false;
      }

      if (filters.isPrimary !== undefined) {
        if (phone.isPrimary !== filters.isPrimary)
          return false;
      }

      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      totalFiltered: filtered.length,
      total: phones.length,
    };
  }, [phones, filters.userId, filters.isActive, filters.isPrimary, page]);

  const totalPages = Math.ceil(
    processedData.totalFiltered / limit
  );

  useEffect(() => {
    setPage(1);
  }, [filters.userId, filters.isActive, filters.isPrimary, filters.search]);

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Gerenciamento de{" "}
            <span className="text-accent">Telefones</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total"
              value={processedData.total.toString()}
              icon={<Phone />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Filtrados"
              value={processedData.totalFiltered.toString()}
              icon={<Users />}
              iconColor="text-info"
            />
            <StatsCard
              label="Páginas"
              value={totalPages.toString()}
              icon={<Layers />}
              iconColor="text-success"
            />
          </div>
        )}

        <UserPhoneTable
          phones={processedData.data}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onPhoneChange={fetchPhones}
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
