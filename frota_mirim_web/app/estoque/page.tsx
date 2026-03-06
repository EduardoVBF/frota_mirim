"use client";

import { getStock, StockItem, StockFilters } from "@/services/stock.service";
import { translateApiErrors } from "@/utils/translateApiError";
import { StockTable } from "@/components/stock/stockTable";
import { useEffect, useState, useCallback } from "react";
import { Package, AlertTriangle } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

export default function StockPage() {
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<StockItem[]>([]);

  const [filters, setFilters] = useState<StockFilters>({
    search: "",
  });

  const [page, setPage] = useState(1);

  const limit = 10;

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: limit,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    totalItems: 0,
    totalUnits: 0,
    lowStock: 0,
  });

  const fetchStock = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getStock({
        ...filters,
        page,
        limit,
      });

      setItems(data.items);
      setMeta(data.meta);
      setStats(data.stats);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar estoque");
        return;
      }

      if (!err.response?.data) {
        toast.error("Erro ao buscar estoque");
        return;
      }

      const { toastMessage } = translateApiErrors(err.response.data);

      toast.error(toastMessage || "Erro ao buscar estoque");

      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = meta.totalPages || 1;

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Controle de <span className="text-accent">Estoque</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Itens em estoque"
              value={stats.totalItems.toString()}
              icon={<Package />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Estoque baixo"
              value={stats.lowStock.toString()}
              icon={<AlertTriangle />}
              iconColor="text-warning"
            />

            <StatsCard
              label="Total unidades"
              value={stats.totalUnits.toString()}
              icon={<Package />}
              iconColor="text-success"
            />
          </div>
        )}

        <StockTable
          items={items}
          isLoading={loading}
          onChange={fetchStock}
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