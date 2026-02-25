"use client";
import {
  FuelSupply,
  createFuelSupply,
  updateFuelSupply,
  deleteFuelSupply,
  CreateFuelSupplyPayload,
  FuelSupplyFilters,
} from "@/services/fuel-supply.service";
import { Edit2, Trash2, Plus, Fuel, Filter, FilterX } from "lucide-react";
import { translateApiErrors } from "@/utils/translateApiError";
import FuelSupplyFormModal from "./FuelSupplyFormModal";
import { Vehicle } from "@/services/vehicles.service";
import PrimarySelect from "../form/primarySelect";
import toast, { Toaster } from "react-hot-toast";
import PrimaryInput from "../form/primaryInput";
import FilterChips from "./FilterChips";
import LoaderComp from "../loaderComp";
import utc from "dayjs/plugin/utc";
import { AxiosError } from "axios";
import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";

type Props = {
  vehicleId?: string;
  abastecimentos: FuelSupply[];
  vehicles: Vehicle[];
  isLoading: boolean;
  filters: FuelSupplyFilters;
  setFilters: React.Dispatch<React.SetStateAction<FuelSupplyFilters>>;
  onChange: () => void;
};

dayjs.extend(utc);

export function FuelSupplyTable({
  vehicleId,
  abastecimentos,
  vehicles,
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

  const activeFiltersCount =
    (filters.vehicleId ? 1 : 0) +
    (filters.tipoCombustivel ? 1 : 0) +
    (filters.postoTipo ? 1 : 0) +
    (filters.tanqueCheio !== undefined ? 1 : 0) +
    (filters.dataInicio ? 1 : 0) +
    (filters.dataFim ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      vehicleId: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      tipoCombustivel: undefined,
      postoTipo: undefined,
      tanqueCheio: undefined,
    });
  };

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
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <Toaster />

      {/* MODAL */}
      <FuelSupplyFormModal
        key={editingItem ? editingItem.id : "new-fuel"}
        open={modalOpen}
        loading={loadingAction}
        vehicleId={vehicleId}
        initialData={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
          setErrors({});
        }}
        onSubmit={handleSubmit}
        errors={errors}
      />

      {/* HEADER PADRÃO */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Fuel size={30} />
          </div>
          <h2 className="text-lg font-bold">
            Histórico de Abastecimentos Geral
          </h2>
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
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition"
          >
            <Plus size={18} /> Novo Abastecimento
          </button>
        </div>
      </div>

      {/* FILTROS DENTRO DA TABELA */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border bg-background/40 space-y-6">
          {/* FILTER CHIPS */}
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
              value={
                filters.tanqueCheio === undefined
                  ? ""
                  : filters.tanqueCheio
                    ? "true"
                    : "false"
              }
              options={[
                { label: "Cheio", value: "true" },
                { label: "Parcial", value: "false" },
              ]}
              onChange={(val) =>
                setFilters({
                  ...filters,
                  tanqueCheio: val === "" ? undefined : val === "true",
                })
              }
            />
          </div>

          {/* FILTROS AVANÇADOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PrimarySelect
              label="Veículo"
              value={filters.vehicleId || ""}
              onChange={(val) =>
                setFilters({
                  ...filters,
                  vehicleId: val || undefined,
                })
              }
              options={[
                { label: "Todos os veículos", value: "" },
                ...vehicles.map((v) => ({
                  label: `${v.modelo} - ${v.placa}`,
                  value: v.id,
                })),
              ]}
            />

            <PrimaryInput
              label="Data Início"
              type="date"
              value={filters.dataInicio || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dataInicio: e.target.value || undefined,
                })
              }
            />

            <PrimaryInput
              label="Data Fim"
              type="date"
              value={filters.dataFim || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dataFim: e.target.value || undefined,
                })
              }
            />
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* TABLE (SEU LAYOUT ORIGINAL PRESERVADO) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <th className="px-6 py-4">Veículo</th>
              <th className="px-6 py-4">Data e KM</th>
              <th className="px-6 py-4">Abastecimento</th>
              <th className="px-6 py-4">Combustível e Tanque</th>
              <th className="px-6 py-4">Posto</th>
              <th className="px-6 py-4">Média</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <LoaderComp />
                </td>
              </tr>
            </tbody>
          ) : abastecimentos.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted">
                  Nenhum abastecimento encontrado.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-border">
              {abastecimentos.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-background/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      className="flex flex-col"
                      href={`/veiculos/${
                        vehicles.find((v) => v.id === item.vehicleId)?.placa
                      }`}
                    >
                      <span className="text-sm font-bold text-muted">
                        {vehicles.find((v) => v.id === item.vehicleId)
                          ?.modelo || "Veículo Desconhecido"}
                      </span>
                      <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-background border border-border w-fit">
                        {vehicles.find((v) => v.id === item.vehicleId)?.placa ||
                          "-"}
                      </span>
                    </Link>
                  </td>

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
                      <span className="text-xs text-muted">
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
                    {item.media ? `${Number(item.media).toFixed(2)} Km/L` : "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setModalOpen(true);
                        }}
                        className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        disabled={loadingAction}
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
