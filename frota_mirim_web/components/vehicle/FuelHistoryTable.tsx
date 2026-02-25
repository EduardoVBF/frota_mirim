"use client";
import {
  FuelSupply,
  deleteFuelSupply,
  updateFuelSupply,
  createFuelSupply,
  CreateFuelSupplyPayload,
} from "@/services/fuel-supply.service";
import {
  Fuel,
  Trash2,
  Edit2,
  Car,
  Filter,
  FilterX,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import FuelSupplyFormModal from "@/components/fuel-supply/FuelSupplyFormModal";
import { translateApiErrors } from "@/utils/translateApiError";
import { Vehicle } from "@/services/vehicles.service";
import Pagination from "@/components/paginationComp";
import { useState, useMemo, useEffect } from "react";
import PrimarySelect from "../form/primarySelect";
import PrimaryInput from "../form/primaryInput";
import toast from "react-hot-toast";
import utc from "dayjs/plugin/utc";
import { AxiosError } from "axios";
import dayjs from "dayjs";

type Props = {
  vehicle: Vehicle;
  abastecimentos: FuelSupply[];
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onChange: () => void;
};

dayjs.extend(utc);

export function FuelHistoryTable({
  vehicle,
  abastecimentos,
  page,
  limit,
  onPageChange,
  onChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FuelSupply | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filters, setFilters] = useState({
    tipoCombustivel: "",
    postoTipo: "",
    tanqueCheio: "",
    dataInicio: "",
    dataFim: "",
  });

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    onPageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const processedData = useMemo(() => {
    const sorted = [...abastecimentos].sort((a, b) => {
      const valueA = dayjs(a.data).valueOf();
      const valueB = dayjs(b.data).valueOf();
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });

    const filtered = sorted.filter((item) => {
      const dataItem = dayjs.utc(item.data);

      if (
        filters.tipoCombustivel &&
        item.tipoCombustivel !== filters.tipoCombustivel
      )
        return false;

      if (filters.postoTipo && item.postoTipo !== filters.postoTipo)
        return false;

      if (filters.tanqueCheio !== "") {
        const isCheio = filters.tanqueCheio === "true";
        if (item.tanqueCheio !== isCheio) return false;
      }

      if (filters.dataInicio) {
        if (dataItem.isBefore(dayjs.utc(filters.dataInicio).startOf("day")))
          return false;
      }

      if (filters.dataFim) {
        if (dataItem.isAfter(dayjs.utc(filters.dataFim).endOf("day")))
          return false;
      }

      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
    };
  }, [abastecimentos, filters, sortOrder, page, limit]);

  const totalPages = Math.ceil(processedData.total / limit);

  const handleClearFilters = () => {
    setFilters({
      tipoCombustivel: "",
      postoTipo: "",
      tanqueCheio: "",
      dataInicio: "",
      dataFim: "",
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // CREATE / UPDATE
  const handleSubmit = async (data: CreateFuelSupplyPayload) => {
    setLoadingAction(true);
    try {
      if (editingItem) {
        await updateFuelSupply(editingItem.id, data);
        toast.success("Abastecimento atualizado");
      } else {
        await createFuelSupply(data);
        toast.success("Abastecimento registrado");
      }

      setModalOpen(false);
      setEditingItem(null);
      await onChange();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar o abastecimento");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao salvar o abastecimento");
          return;
        }
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar o abastecimento");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este abastecimento?")) return;

    setLoadingAction(true);
    try {
      await deleteFuelSupply(id);
      toast.success("Abastecimento excluído");
      await onChange();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao excluir o abastecimento");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao excluir o abastecimento");
          return;
        }
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao excluir o abastecimento");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      <div className="mt-10 bg-alternative-bg border border-border rounded-2xl overflow-hidden">
        <FuelSupplyFormModal
          key={editingItem ? editingItem.id : "new-fuel"}
          open={modalOpen}
          loading={loadingAction}
          vehicleId={vehicle.id}
          initialData={editingItem}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
            setErrors({});
          }}
          onSubmit={handleSubmit}
          errors={errors}
        />

        {/* HEADER */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Fuel size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Histórico de Abastecimentos</h2>
              <div className="flex items-center gap-1">
                <Car size={20} />
                <span className="text-sm font-bold">
                  {vehicle.placa} - {vehicle.modelo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <>
                  <FilterX size={16} /> Filtros
                </>
              ) : (
                <>
                  <Filter size={16} /> Filtros
                </>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                {activeFiltersCount} filtro(s)
              </span>
            )}

            <button
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer"
            >
              + Novo Abastecimento
            </button>
          </div>
        </div>

        {/* FILTROS */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-border bg-background/40 flex flex-wrap gap-4 items-end">
            <PrimarySelect
              label="Combustível"
              width="auto"
              value={filters.tipoCombustivel}
              onChange={(value) =>
                setFilters({ ...filters, tipoCombustivel: value })
              }
              options={[
                { label: "Todos", value: "" },
                { label: "Gasolina", value: "GASOLINA" },
                { label: "Etanol", value: "ETANOL" },
                { label: "Diesel", value: "DIESEL" },
              ]}
            />

            <PrimarySelect
              label="Posto"
              width="auto"
              value={filters.postoTipo}
              onChange={(value) => setFilters({ ...filters, postoTipo: value })}
              options={[
                { label: "Todos", value: "" },
                { label: "Interno", value: "INTERNO" },
                { label: "Externo", value: "EXTERNO" },
              ]}
            />

            <PrimarySelect
              label="Tanque"
              width="auto"
              className="min-w-35"
              value={filters.tanqueCheio}
              onChange={(value) =>
                setFilters({ ...filters, tanqueCheio: value })
              }
              options={[
                { label: "Todos", value: "" },
                { label: "Tanque Cheio", value: "true" },
                { label: "Parcial", value: "false" },
              ]}
            />

            <PrimaryInput
              label="Data Início"
              width="auto"
              type="date"
              value={filters.dataInicio}
              onChange={(e) =>
                setFilters({ ...filters, dataInicio: e.target.value })
              }
            />

            <PrimaryInput
              label="Data Fim"
              width="auto"
              type="date"
              value={filters.dataFim}
              onChange={(e) =>
                setFilters({ ...filters, dataFim: e.target.value })
              }
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
        )}

        {/* TABELA ORIGINAL (INALTERADA) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer select-none"
                  onClick={toggleSortOrder}
                >
                  <div className="flex items-center gap-2">
                    <span>Data e KM</span>
                    <span className="text-xs">
                      {sortOrder === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4">Abastecimento</th>
                <th className="px-6 py-4">Combustível e Tanque</th>
                <th className="px-6 py-4">Posto</th>
                <th className="px-6 py-4">Média</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {processedData.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    Nenhum abastecimento encontrado.
                  </td>
                </tr>
              ) : (
                processedData.data.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-background/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {dayjs.utc(item.data).format("DD/MM/YYYY")}
                        </span>
                        <span className="text-xs text-muted">
                          {item.kmAtual.toLocaleString()} km
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-success">
                          R$ {Number(item.valorTotal).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-muted">
                          {Number(item.litros).toFixed(2)} L × R${" "}
                          {Number(item.valorLitro).toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-muted">
                          {item.tipoCombustivel || "—"}
                        </span>
                        <span className="text-xs text-muted">
                          {item.tanqueCheio ? (
                            <p className="text-success">Tanque Cheio ✔</p>
                          ) : (
                            <p className="text-info">Tanque parcial ➖</p>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-bold text-muted">
                        {item.postoNome || item.postoTipo}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-info">
                      {item.media
                        ? `${Number(item.media).toFixed(2)} Km/L`
                        : "-"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setModalOpen(true);
                          }}
                          className="p-2 text-muted hover:text-accent"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-muted hover:text-error"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
