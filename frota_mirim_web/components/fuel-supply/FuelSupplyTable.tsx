"use client";

import {
  FuelSupply,
  createFuelSupply,
  updateFuelSupply,
  deleteFuelSupply,
  CreateFuelSupplyPayload,
  FuelSupplyFilters,
} from "@/services/fuel-supply.service";
import FuelSupplyFormModal from "./FuelSupplyFormModal";
import { Edit2, Trash2, Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import LoaderComp from "../loaderComp";
import { useState } from "react";

type Props = {
  vehicleId?: string;
  abastecimentos: FuelSupply[];
  isLoading: boolean;
  filters: FuelSupplyFilters;
  setFilters: React.Dispatch<React.SetStateAction<FuelSupplyFilters>>;
  onChange: () => void;
};

export function FuelSupplyTable({
  vehicleId,
  abastecimentos,
  isLoading,
  onChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FuelSupply | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

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
    } catch {
      toast.error("Erro ao salvar abastecimento");
    } finally {
      setLoadingAction(false);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este abastecimento?")) return;

    setLoadingAction(true);

    try {
      await deleteFuelSupply(id);
      toast.success("Abastecimento excluído");
      await onChange();
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setLoadingAction(false);
    }
  };

  // MODAL CONTROL
  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: FuelSupply) => {
    setEditingItem(item);
    setModalOpen(true);
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
        }}
        onSubmit={handleSubmit}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Histórico de Abastecimentos</h2>
          <span className="text-xs text-muted">
            {abastecimentos.length} registros nesta página
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition"
          >
            <Plus size={18} /> Novo Abastecimento
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">KM</th>
              <th className="px-6 py-4">Litros</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Combustível</th>
              <th className="px-6 py-4">Tanque</th>
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
                  <td className="px-6 py-4 text-sm">
                    {new Date(item.data).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-sm font-mono">
                    {item.kmAtual.toLocaleString()} km
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {Number(item.litros).toFixed(2)} L
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-success">
                    R$ {Number(item.valorTotal).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-xs uppercase">
                    {item.tipoCombustivel}
                  </td>

                  <td className="px-6 py-4">
                    {item.tanqueCheio ? (
                      <span className="px-2 py-1 rounded bg-accent/10 text-accent text-xs font-bold">
                        Cheio
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-background border text-muted text-xs">
                        Parcial
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm font-bold text-info">
                    {item.media ? `${Number(item.media).toFixed(2)} Km/L` : "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
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
