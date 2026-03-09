"use client";
import {
  ItemCatalog,
  ItemCatalogFilters,
} from "@/services/itemCatalog.service";
import { Filter, FilterX, Plus, Edit2, Package, Search } from "lucide-react";
import ItemCatalogFormModal from "./itemCatalogFormModal";
import FilterChips from "../fuel-supply/FilterChips";
import LoaderComp from "../loaderComp";
import { useState } from "react";

export function ItemCatalogTable({
  items,
  isLoading,
  filters,
  setFilters,
  onChange,
}: {
  items: ItemCatalog[];
  isLoading: boolean;
  filters: ItemCatalogFilters;
  setFilters: (filters: Partial<ItemCatalogFilters>) => void;
  onChange: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemCatalog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount =
    (filters.type ? 1 : 0) +
    (filters.isStockItem !== undefined ? 1 : 0) +
    (filters.isActive !== undefined ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: undefined,
      isStockItem: undefined,
      isActive: undefined,
    });
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <ItemCatalogFormModal
        open={isModalOpen}
        onClose={() => {
          setEditingItem(null);
          setIsModalOpen(false);
        }}
        onSuccess={onChange}
        initialData={editingItem || undefined}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Package size={26} />
          </div>

          <h2 className="text-lg font-bold">Catálogo de Itens</h2>
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border flex items-end gap-4">
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
              placeholder="Buscar por nome ou email..."
            />
          </div>
          <div className="flex items-center gap-4">
            <FilterChips
              label="Tipo"
              value={filters.type?.[0] || ""}
              onChange={(value) =>
                setFilters({
                  type:
                    filters.type?.[0] === value
                      ? undefined
                      : [value as "PART" | "SERVICE"],
                })
              }
              options={[
                { label: "Peça", value: "PART" },
                { label: "Serviço", value: "SERVICE" },
              ]}
            />

            <FilterChips
              label="Estoque"
              value={
                filters.isStockItem === undefined
                  ? ""
                  : filters.isStockItem
                    ? "true"
                    : "false"
              }
              onChange={(value) =>
                setFilters({
                  isStockItem: value === "" ? undefined : value === "true",
                })
              }
              options={[
                { label: "Com estoque", value: "true" },
                { label: "Sem estoque", value: "false" },
              ]}
            />

            <FilterChips
              label="Status"
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive
                    ? "true"
                    : "false"
              }
              onChange={(value) =>
                setFilters({
                  ...filters,
                  isActive:
                    filters.isActive?.toString() === value
                      ? undefined
                      : value === "true"
                        ? true
                        : value === "false"
                          ? false
                          : undefined,
                })
              }
              options={[
                { label: "Ativo", value: "true" },
                { label: "Inativo", value: "false" },
              ]}
            />

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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Referência</th>
                <th className="px-6 py-4">Preço padrão</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Ativo</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    Nenhum item encontrado
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-6 py-4 font-bold">{item.name}</td>

                    <td className="px-6 py-4">
                      {item.type === "PART" ? "Peça" : "Serviço"}
                    </td>

                    <td className="px-6 py-4">{item.reference || "-"}</td>

                    <td className="px-6 py-4">
                      {item.defaultPrice ? `R$ ${item.defaultPrice}` : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {item.isStockItem ? "Sim" : "Não"}
                    </td>

                    <td className="px-6 py-4">
                      {item.isActive ? "Sim" : "Não"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:text-accent"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
