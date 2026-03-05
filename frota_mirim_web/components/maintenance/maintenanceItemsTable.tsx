"use client";
import AddMaintenanceItemModal from "./addMaintenanceItemModal";
import { Maintenance } from "@/services/maintenance.service";
import { Plus, Wrench } from "lucide-react";
import { useState } from "react";

export function MaintenanceItemsTable({
  maintenance,
}: {
  maintenance: Maintenance;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (value: string) => {
    const number = Number(value);

    if (isNaN(number)) return "0,00";
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <AddMaintenanceItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          <Plus size={16} />
          Adicionar item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-muted border-b border-border">
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Referência</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Quantidade</th>
              <th className="px-6 py-4">Valor unit</th>
              <th className="px-6 py-4">Total</th>
            </tr>
          </thead>

          <tbody>
            {maintenance.maintenanceItems && maintenance.maintenanceItems.length > 0 ? (
              maintenance.maintenanceItems.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="px-6 py-4">{item.nameSnapshot}</td>
                  <td className="px-6 py-4">{item.referenceSnapshot || "-"}</td>
                  <td className="px-6 py-4">
                    {item.typeSnapshot === "PART" ? "Peça" : "Serviço"}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">R$ {formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4">
                    R$ {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  Nenhum item adicionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
