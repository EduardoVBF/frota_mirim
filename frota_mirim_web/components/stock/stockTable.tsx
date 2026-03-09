"use client";
import {
  Forklift,
  Settings,
  ArrowUpDown,
  Filter,
  FilterX,
  Search,
} from "lucide-react";
import { StockItem, StockFilters } from "@/services/stock.service";
import StockMovementModal from "./stockMovementModal";
import StockConfigModal from "./stockConfigModal";
import LoaderComp from "../loaderComp";
import { useState } from "react";

export function StockTable({
  items,
  isLoading,
  filters,
  setFilters,
  onChange,
}: {
  items: StockItem[];
  isLoading: boolean;
  filters: StockFilters;
  setFilters: (filters: StockFilters) => void;
  onChange: () => void;
}) {
  const [movementItem, setMovementItem] = useState<StockItem | null>(null);
  const [configItem, setConfigItem] = useState<StockItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = filters.search ? 1 : 0;

  const handleClearFilters = () => {
    setFilters({
      search: "",
    });
  };

  const formatMoney = (value: string | number) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <StockMovementModal
        open={!!movementItem}
        item={movementItem}
        onClose={() => setMovementItem(null)}
        onSuccess={onChange}
      />

      <StockConfigModal
        open={!!configItem}
        item={configItem}
        onClose={() => setConfigItem(null)}
        onSuccess={onChange}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Forklift size={26} />
          </div>
          <h2 className="text-lg font-bold">Itens em estoque</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg"
          >
            {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
            Filtros
          </button>

          {activeFiltersCount > 0 && (
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
              {activeFiltersCount} filtro(s)
            </span>
          )}
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border flex items-end gap-4">
          {/* SEARCH */}
          <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm h-fit">
            <Search size={18} className="text-muted" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Buscar por nome..."
            />
          </div>

          <div className="flex items-center gap-4">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="ml-auto px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* TABLE */}
      {isLoading ? (
        <div className="p-6">
          <LoaderComp />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted border-b border-border">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Referência</th>
                <th className="px-6 py-4">Preço padrão</th>
                <th className="px-6 py-4">Quantidade</th>
                <th className="px-6 py-4">Mínimo</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    Nenhum item encontrado
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLowStock =
                    item.minimumQuantity &&
                    item.currentQuantity < item.minimumQuantity;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-border ${
                        isLowStock ? "bg-warning/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-bold">
                        {item.itemCatalog.name}
                      </td>

                      <td className="px-6 py-4">
                        {item.itemCatalog.reference || "-"}
                      </td>

                      <td className="px-6 py-4">
                        {formatMoney(item.itemCatalog.defaultPrice) || "-"}
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {item.currentQuantity}
                      </td>

                      <td className="px-6 py-4">
                        {item.minimumQuantity || "-"}
                      </td>

                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => setMovementItem(item)}
                          className="p-2 hover:text-success cursor-pointer"
                        >
                          <ArrowUpDown size={16} />
                        </button>

                        <button
                          onClick={() => setConfigItem(item)}
                          className="p-2 hover:text-accent cursor-pointer"
                        >
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
