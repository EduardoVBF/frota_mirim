"use client";
import {
  FuelSupply,
  deleteFuelSupply,
  updateFuelSupply,
  createFuelSupply,
  CreateFuelSupplyPayload,
  FuelSupplyFilters,
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
import FilterChips from "../fuel-supply/FilterChips";
import PrimaryInput from "../form/primaryInput";
import LoaderComp from "../loaderComp";
import toast from "react-hot-toast";
import utc from "dayjs/plugin/utc";
import { AxiosError } from "axios";
import { useState } from "react";
import dayjs from "dayjs";

dayjs.extend(utc);

type Props = {
  vehicle: Vehicle;
  abastecimentos: FuelSupply[];
  isLoading: boolean;
  filters: FuelSupplyFilters;
  setFilters: (filters: FuelSupplyFilters) => void;
  onChange: () => void;
};

export function FuelHistoryTable({
  vehicle,
  abastecimentos,
  isLoading,
  filters,
  setFilters,
  onChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FuelSupply | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      !["page", "limit", "vehicleId"].includes(key) &&
      value !== "" &&
      value !== undefined,
  ).length;

  const handleClearFilters = () => {
    setFilters({
      tipoCombustivel: undefined,
      postoTipo: undefined,
      tanqueCheio: undefined,
      dataInicio: "",
      dataFim: "",
    });
  };

  const toggleSortOrder = () =>
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");

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
      onChange();
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
    if (!confirm("Deseja realmente excluir?")) return;
    setLoadingAction(true);
    try {
      await deleteFuelSupply(id);
      toast.success("Excluído");
      onChange();
    } catch {
      toast.error("Erro ao excluir");
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

        {/* HEADER ORIGINAL */}
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
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <FilterX size={16} /> : <Filter size={16} />}{" "}
              Filtros
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              + Novo Abastecimento
            </button>
          </div>
        </div>

        {/* FILTROS INTEGRADOS AO PAI */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-border bg-background/40 flex flex-wrap gap-4 items-end">
            <div className="flex flex-wrap gap-4">
              <FilterChips
                label="Combustível"
                options={[
                  { label: "Gasolina", value: "GASOLINA" },
                  { label: "Etanol", value: "ETANOL" },
                  { label: "Diesel", value: "DIESEL" },
                ]}
                value={filters.tipoCombustivel}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    tipoCombustivel: val || undefined,
                  })
                }
              />

              <FilterChips
                label="Posto"
                options={[
                  { label: "Interno", value: "INTERNO" },
                  { label: "Externo", value: "EXTERNO" },
                ]}
                value={filters.postoTipo}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    postoTipo: val || undefined,
                  })
                }
              />

              <FilterChips
                label="Tanque"
                value={filters.tanqueCheio}
                options={[
                  { label: "Cheio", value: true },
                  { label: "Parcial", value: false },
                ]}
                onChange={(val) => {
                  let convertedValue: boolean | undefined = undefined;

                  if (val === true || val === "true") convertedValue = true;
                  if (val === false || val === "false") convertedValue = false;

                  setFilters({
                    ...filters,
                    tanqueCheio: convertedValue,
                  });
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <PrimaryInput
                label="Data Início"
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({ dataInicio: e.target.value })}
              />
              <PrimaryInput
                label="Data Fim"
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({ dataFim: e.target.value })}
              />
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="ml-auto px-4 py-2 text-sm rounded-lg border border-border"
              >
                Limpar
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={toggleSortOrder}
                >
                  <div className="flex items-center gap-2">
                    Data e KM{" "}
                    {sortOrder === "asc" ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    )}
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <LoaderComp />
                  </td>
                </tr>
              ) : abastecimentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    Nenhum abastecimento encontrado.
                  </td>
                </tr>
              ) : (
                abastecimentos.map((item) => (
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
    </>
  );
}
