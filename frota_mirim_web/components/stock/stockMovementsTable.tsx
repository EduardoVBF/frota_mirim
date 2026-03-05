"use client";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Filter,
  FilterX,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  StockMovement,
  StockFilters,
  StockMovementType,
} from "@/services/stock.service";
import FilterChips from "../fuel-supply/FilterChips";
import LoaderComp from "../loaderComp";
import { useState } from "react";

export function StockMovementsTable({
  movements,
  isLoading,
  filters,
  setFilters,
}: {
  movements: StockMovement[];
  isLoading: boolean;
  filters: StockFilters;
  setFilters: (filters: StockFilters) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = filters.search ? 1 : 0 + (filters.type ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: undefined,
    });
  };

  const getTypeIcon = (type: string) => {
    if (type === "IN") return <ArrowDown size={16} className="text-success" />;

    if (type === "OUT") return <ArrowUp size={16} className="text-error" />;

    return <RotateCcw size={16} className="text-warning" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === "IN") return "Entrada";
    if (type === "OUT") return "Saída";
    return "Ajuste";
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <ArrowUpDown size={26} />
          </div>
          <h2 className="text-lg font-bold">Histórico de movimentações</h2>
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
        <div className="px-6 py-4 border-b border-border flex items-end gap-4 w-full">
          <div className="flex items-center gap-4 flex-wrap w-full">
            {/* SEARCH */}
            <div className="flex items-center self-end gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm h-fit">
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
                placeholder="Buscar por item..."
              />
            </div>

            <FilterChips
              label="Tipo"
              options={[
                { label: "Entrada", value: "IN" },
                { label: "Saída", value: "OUT" },
                { label: "Ajuste", value: "ADJUST" },
              ]}
              value={filters.type}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  type: value as StockMovementType[] | undefined,
                })
              }
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

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-muted border-b border-border">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Quantidade</th>
              <th className="px-6 py-4">Motivo</th>
              <th className="px-6 py-4">Custo</th>
              <th className="px-6 py-4">Referência</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <LoaderComp />
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  Nenhuma movimentação encontrada.
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr key={movement.id} className="border-b border-border">
                  <td className="px-6 py-4">
                    {new Date(movement.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(movement.type)}
                      <span className="text-sm font-bold">
                        {getTypeLabel(movement.type)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {movement.itemCatalog.name || "-"}
                  </td>

                  <td className="px-6 py-4 font-bold">{movement.quantity}</td>

                  <td className="px-6 py-4">{movement.reason || "-"}</td>

                  <td className="px-6 py-4">
                    {movement.unitCost ? `R$ ${movement.unitCost}` : "-"}
                  </td>

                  <td className="px-6 py-4">{movement.referenceId || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
