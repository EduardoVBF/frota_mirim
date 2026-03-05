"use client";
import { getStock, StockItem, StockFilters } from "@/services/stock.service";
import { Package, AlertTriangle, ArrowUpDown } from "lucide-react";
import { translateApiErrors } from "@/utils/translateApiError";
import { StockTable } from "@/components/stock/stockTable";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";
import Link from "next/link";

export default function StockPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);

  const [filters, setFilters] = useState<StockFilters>({
    search: "",
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchStock = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getStock({
        ...filters,
        page,
        limit,
      });
      setItems(data);
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
  }, [filters, page]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.ceil(items.length / limit);

  const lowStock = items.filter(
    (i) => i.minimumQuantity && i.currentQuantity < i.minimumQuantity,
  );

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
              value={items.length.toString()}
              icon={<Package />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Estoque baixo"
              value={lowStock.length.toString()}
              icon={<AlertTriangle />}
              iconColor="text-warning"
            />

            <StatsCard
              label="Total unidades"
              value={items
                .reduce((acc, i) => acc + i.currentQuantity, 0)
                .toString()}
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

        <div className="pt-4 w-full justify-end flex">
          <Link
            href="/estoque/movimentacoes"
            className="flex items-center gap-2 w-fit bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] hover:bg-accent-dark transition-all"
          >
            <ArrowUpDown size={18} />
            Ver movimentações de estoque
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
