"use client";
import {
  FuelSupply,
  deleteFuelSupply,
  updateFuelSupply,
  createFuelSupply,
  CreateFuelSupplyPayload,
} from "@/services/fuel-supply.service";
import FuelSupplyFormModal from "@/components/fuel-supply/FuelSupplyFormModal";
import { Fuel, Trash2, Edit2, Car } from "lucide-react";
import { Vehicle } from "@/services/vehicles.service";
import toast from "react-hot-toast";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import dayjs from "dayjs";

type Props = {
  vehicle: Vehicle;
  abastecimentos: FuelSupply[];
  onChange: () => void;
};

dayjs.extend(utc);

export function FuelHistoryTable({ vehicle, abastecimentos, onChange }: Props) {
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

  return (
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
        }}
        onSubmit={handleSubmit}
      />

      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Fuel size={30} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Histórico de Abastecimentos</h2>
            <div className="flex items-center gap-1">
              <Car
                size={20}
                className="inline-block text-foreground font-bold"
              />
              <span className="text-sm text-foreground font-bold">
                {vehicle.placa} - {vehicle.modelo}
              </span>
            </div>
          </div>
        </div>

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

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="px-6 py-4">Data e KM</th>
              <th className="px-6 py-4">Abastecimento</th>
              <th className="px-6 py-4">Combustível e Tanque</th>
              <th className="px-6 py-4">Posto</th>
              <th className="px-6 py-4">Média</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {abastecimentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted">
                  Nenhum abastecimento registrado.
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
                    {item.media ? `${Number(item.media).toFixed(2)} Km/L` : "-"}
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
  );
}
