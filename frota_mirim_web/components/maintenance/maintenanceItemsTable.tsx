"use client";

import {
  deleteMaintenanceItem,
} from "@/services/maintenanceItem.service";

import { Maintenance } from "@/services/maintenance.service";

import { useState } from "react";

import AddMaintenanceItemModal from "./addMaintenanceItemModal";

import { Plus, Trash2, Wrench } from "lucide-react";

import LoaderComp from "../loaderComp";

import toast from "react-hot-toast";

export function MaintenanceItemsTable({
  maintenance,
  onUpdate,
}: {
  maintenance: Maintenance;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const items = maintenance.maintenanceItems;

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);

      await deleteMaintenanceItem(id);

      toast.success("Item removido");

      onUpdate();

    } catch {
      toast.error("Erro ao remover item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden">

      <AddMaintenanceItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onUpdate}
        maintenanceId={maintenance.id}
      />

      <div className="p-4 border-b border-border flex justify-between items-center">

        <div className="flex items-center gap-3">

          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Wrench size={24} />
          </div>

          <h2 className="text-lg font-bold">Itens utilizados</h2>

        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          <Plus size={16} />
          Adicionar item
        </button>

      </div>

      {loading ? (
        <div className="p-6">
          <LoaderComp />
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="text-xs uppercase text-muted border-b border-border">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Quantidade</th>
                <th className="px-6 py-4">Valor unit</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>

              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    Nenhum item adicionado
                  </td>
                </tr>
              ) : (
                items.map((item) => (

                  <tr key={item.id} className="border-b border-border">

                    <td className="px-6 py-4 font-bold">
                      {item.nameSnapshot}
                    </td>

                    <td className="px-6 py-4">
                      {item.typeSnapshot === "PART" ? "Peça" : "Serviço"}
                    </td>

                    <td className="px-6 py-4">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4">
                      {item.unitPrice.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td className="px-6 py-4 font-bold">
                      {item.totalPrice.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:text-error"
                      >
                        <Trash2 size={16} />
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