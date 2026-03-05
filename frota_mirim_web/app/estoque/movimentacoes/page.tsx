"use client";
import {
  getStockMovements,
  StockFilters,
  StockMovementListResponse,
} from "@/services/stock.service";
import { StockMovementsTable } from "@/components/stock/stockMovementsTable";
import { PackageSearch, ArrowDown, ArrowUp, ArrowLeft } from "lucide-react";
import { translateApiErrors } from "@/utils/translateApiError";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";
import Link from "next/link";

export default function StockMovementsPage() {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovementListResponse>({
    items: [],
    meta: {
      total: 0,
      totalFiltered: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  });
  const [filters, setFilters] = useState<StockFilters>({
    search: "",
    type: undefined,
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchMovements = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getStockMovements({
        ...filters,
        page,
        limit,
      });
      setMovements(data as unknown as StockMovementListResponse);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar movimentações");
        return;
      }

      if (!err.response?.data) {
        toast.error("Erro ao buscar movimentações");
        return;
      }

      const { toastMessage } = translateApiErrors(err.response.data);

      toast.error(toastMessage || "Erro ao buscar movimentações");
      setMovements({
        items: [],
        meta: {
          total: 0,
          totalFiltered: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = movements?.meta?.totalPages;
  const entries = movements?.items.filter((m) => m.type === "IN");
  const exits = movements?.items.filter((m) => m.type === "OUT");

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">
        <Link
          href="/estoque"
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para estoque
        </Link>

        <header>
          <h1 className="text-3xl font-bold">
            Movimentações de <span className="text-accent">Estoque</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total movimentações"
              value={movements.meta.total.toString()}
              icon={<PackageSearch />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Entradas"
              value={entries.length.toString()}
              icon={<ArrowDown />}
              iconColor="text-success"
            />

            <StatsCard
              label="Saídas"
              value={exits.length.toString()}
              icon={<ArrowUp />}
              iconColor="text-error"
            />
          </div>
        )}

        <StockMovementsTable
          movements={movements.items}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
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
