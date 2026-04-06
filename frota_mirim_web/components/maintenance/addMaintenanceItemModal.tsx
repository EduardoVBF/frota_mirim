"use client";
import {
  createMaintenanceItem,
  updateMaintenanceItem,
  MaintenanceItem,
} from "@/services/maintenanceItem.service";
import { getItemCatalog, ItemCatalog } from "@/services/itemCatalog.service";
import PrimarySelect from "../form/primarySelect";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddMaintenanceItemModal({
  open,
  onClose,
  onSuccess,
  maintenanceId,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maintenanceId: string;
  item?: MaintenanceItem | null;
}) {
  const isEdit = !!item;

  const [items, setItems] = useState<ItemCatalog[]>([]);

  const [itemCatalogId, setItemCatalogId] = useState("");

  const [quantity, setQuantity] = useState("1");

  const [unitPrice, setUnitPrice] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await getItemCatalog({
          page: 1,
          limit: 1000,
          isActive: true,
        });

        setItems(data.items);
      } catch {
        toast.error("Erro ao carregar catálogo");
      }
    }

    if (open && !isEdit) {
      fetchItems();
    }
  }, [open, isEdit]);

  useEffect(() => {
    if (item) {
      setItemCatalogId(item.itemCatalogId);
      setQuantity(String(item.quantity));
      setUnitPrice(String(item.unitPrice));
    }
  }, [item]);

  const resetForm = () => {
    setItemCatalogId("");
    setQuantity("1");
    setUnitPrice("");
  };

  const formatMoney = (value: string | number) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isEdit && item) {
        await updateMaintenanceItem(item.id, {
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        });

        toast.success("Item atualizado");
      } else {
        await createMaintenanceItem(maintenanceId, {
          itemCatalogId,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        });

        toast.success("Item adicionado");
      }

      resetForm();

      onSuccess();

      onClose();
    } catch {
      toast.error("Erro ao salvar item");
    } finally {
      setLoading(false);
    }
  };

  const total = Number(quantity) * Number(unitPrice);

  return (
    <PrimaryModal
      isOpen={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={isEdit ? "Editar item" : "Adicionar item"}
      footer={
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-accent text-white rounded-xl font-bold"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      }
    >
      <div className="space-y-4">
        {!isEdit ? (
          <PrimarySelect
            searchable
            label="Item do catálogo"
            value={itemCatalogId}
            onChange={(val) => setItemCatalogId(val as string)}
            options={[
              { label: "Selecione um item", value: "" },
              ...items.map((i) => ({
                label: `${i.name} (${i.type === "PART" ? "Peça" : "Serviço"}) - ${i.reference}`,
                value: i.id,
              })),
            ]}
          />
        ) : (
          <div className="text-sm">
            Item:{" "}
            <strong>
              {items.find((i) => i.id === item.itemCatalogId)?.name ||
                item.nameSnapshot}
            </strong>
          </div>
        )}

        {itemCatalogId && (
          <div className="text-sm text-muted">
            Preço padrão:{" "}
            <strong>
              {formatMoney(
                items.find((i) => i.id === itemCatalogId)?.defaultPrice || 0,
              )}
            </strong>
          </div>
        )}

        <PrimaryInput
          label="Quantidade"
          type="number"
          min="1"
          value={quantity}
          decimalScale={0}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <PrimaryInput
          label="Preço unitário"
          type="number"
          step="0.01"
          value={unitPrice}
          decimalScale={2}
          onChange={(e) => setUnitPrice(e.target.value)}
        />

        {quantity && unitPrice && (
          <div className="text-sm text-muted">
            Total: <strong>{formatMoney(total)}</strong>
          </div>
        )}
      </div>
    </PrimaryModal>
  );
}
