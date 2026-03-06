"use client";
import {
  getItemCatalog,
  ItemCatalog,
  ItemCatalogFilters,
  ItemCatalogResponse,
} from "@/services/itemCatalog.service";
import { ItemCatalogTable } from "@/components/itemCatalog/itemCatalogTable";
import { translateApiErrors } from "@/utils/translateApiError";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { Package, Wrench } from "lucide-react";
import { AxiosError } from "axios";

export default function ItemCatalogPage() {
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<ItemCatalog[]>([]);

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    parts: 0,
    services: 0,
  });

  const [filters, setFilters] = useState<
    ItemCatalogFilters & { search?: string }
  >({
    search: "",
    type: undefined,
    isStockItem: undefined,
    isActive: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchItems = useCallback(async () => {
    setLoading(true);

    try {
      const data: ItemCatalogResponse = await getItemCatalog({
        ...filters,
        page,
        limit,
      });

      setItems(data.items);
      setMeta(data.meta);
      setStats(data.stats);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar os itens");
        return;
      }

      if (!err.response?.data) {
        toast.error("Erro ao buscar os itens");
        return;
      }

      const { toastMessage } = translateApiErrors(err.response.data);

      toast.error(toastMessage || "Erro ao buscar os itens");

      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = meta.totalPages;

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Catálogo de <span className="text-accent">Itens</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total Itens"
              value={meta.total.toString()}
              icon={<Package />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Peças"
              value={stats.parts.toString()}
              icon={<Wrench />}
              iconColor="text-warning"
            />

            <StatsCard
              label="Serviços"
              value={stats.services.toString()}
              icon={<Wrench />}
              iconColor="text-success"
            />
          </div>
        )}

        <ItemCatalogTable
          items={items}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onChange={fetchItems}
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