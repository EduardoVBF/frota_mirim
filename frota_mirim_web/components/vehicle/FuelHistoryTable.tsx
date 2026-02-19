"use client";
import FuelSupplyFormModal from "@/components/fuel-supply/FuelSupplyFormModal";
import { FuelSupply, deleteFuelSupply } from "@/services/fuel-supply.service";
import { CheckCircle2, MapPin, Fuel, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

type Props = {
  vehicleId: string;
  abastecimentos: FuelSupply[];
  onChange: () => void;
};

export function FuelHistoryTable({
  vehicleId,
  abastecimentos,
  onChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FuelSupply | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

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
        vehicleId={vehicleId}
        initialData={editingItem}
        loading={loadingAction}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async () => {
          setModalOpen(false);
          setEditingItem(null);
          await onChange();
        }}
      />

      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Fuel size={20} />
          </div>
          <h2 className="text-lg font-bold">Histórico de Abastecimentos</h2>
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
          <thead className="bg-background/50 text-[10px] uppercase tracking-widest text-muted">
            <tr>
              <th className="px-6 py-4">Data e KM</th>
              <th className="px-6 py-4">Abastecimento</th>
              <th className="px-6 py-4">Local</th>
              <th className="px-6 py-4">Média</th>
              <th className="px-6 py-4 text-center">Tanque</th>
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
                        {new Date(item.data).toLocaleDateString()}
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
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MapPin size={14} />
                      {item.postoNome || item.postoTipo}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {item.media ? (
                      <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold">
                        {Number(item.media).toFixed(2)} Km/L
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {item.tanqueCheio ? (
                      <CheckCircle2
                        size={18}
                        className="text-success mx-auto"
                      />
                    ) : (
                      <span className="text-xs text-muted">Parcial</span>
                    )}
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
