"use client";
import { stockEntry, stockAdjust, StockItem } from "@/services/stock.service";
import PrimarySelect from "../form/primarySelect";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import toast from "react-hot-toast";
import { useState } from "react";

type MovementType = "ENTRY" | "ADJUST";

export default function StockMovementModal({
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
  const [type, setType] = useState<MovementType>("ENTRY");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [cost, setCost] = useState("");

  const handleSubmit = async () => {
    if (!item) return;

    try {
      if (type === "ENTRY") {
        await stockEntry({
          itemCatalogId: item.itemCatalogId,
          quantity: Number(quantity),
          unitCost: cost ? Number(cost) : undefined,
          reason,
        });

        toast.success("Entrada registrada");
      } else {
        await stockAdjust({
          itemCatalogId: item.itemCatalogId,
          quantity: Number(quantity),
          reason,
        });

        toast.success("Estoque ajustado");
      }

      onSuccess();
      onClose();
    } catch {
      toast.error("Erro na movimentação");
    }
  };

  const formatMoney = (value: string | number) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title={`Movimentação de estoque`}
      footer={
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-accent text-white rounded-xl"
        >
          Confirmar
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="uppercase font-bold">{item?.itemCatalog?.name}</p>
            {item?.itemCatalog?.reference && (
              <p className="text-sm text-muted">{item.itemCatalog.reference}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold">Preço padrão:</p>
            <p className="text-sm text-muted">
              {item?.itemCatalog?.defaultPrice
                ? `${formatMoney(item.itemCatalog.defaultPrice)}`
                : "-"}
            </p>
          </div>
        </div>

        <PrimarySelect
          label="Tipo de movimentação"
          value={type}
          onChange={(v) => setType(v as MovementType)}
          options={[
            { label: "Entrada", value: "ENTRY" },
            { label: "Ajuste", value: "ADJUST" },
          ]}
        />

        <PrimaryInput
          label="Quantidade"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {type === "ENTRY" && (
          <PrimaryInput
            label="Custo unitário"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        )}

        <PrimaryInput
          label="Motivo"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </PrimaryModal>
  );
}
