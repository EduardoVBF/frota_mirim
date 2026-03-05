"use client";
import { updateStockConfig, StockItem } from "@/services/stock.service";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function StockConfigModal({
  open,
  onClose,
  onSuccess,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: StockItem | null;
}) {
  const [minimum, setMinimum] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMinimum(item.minimumQuantity?.toString() || "");
      setLocation(item.location || "");
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!item) return;

    try {
      await updateStockConfig(item.itemCatalogId, {
        minimumQuantity: minimum ? Number(minimum) : undefined,
        location: location || undefined,
      });

      toast.success("Configuração atualizada");

      onSuccess();
      onClose();
    } catch {
      toast.error("Erro ao atualizar configuração");
    }
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title={`Configurar estoque`}
      footer={
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-accent text-white rounded-xl"
        >
          Salvar
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="uppercase font-bold">{item?.itemCatalog?.name}</p>
          {item?.itemCatalog?.reference && (
            <p className="text-sm text-muted">
              {item.itemCatalog.reference}
            </p>
          )}
        </div>

        <PrimaryInput
          label="Quantidade mínima"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
        />

        {/* <PrimaryInput
          label="Localização no estoque"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        /> */}
      </div>
    </PrimaryModal>
  );
}
