"use client";

import { getItemCatalog, ItemCatalog } from "@/services/itemCatalog.service";
import { createMaintenanceItem } from "@/services/maintenanceItem.service";

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
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maintenanceId: string;
}) {
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

    if (open) {
      fetchItems();
    }
  }, [open]);

  useEffect(() => {
    const selected = items.find((i) => i.id === itemCatalogId);

    if (selected?.defaultPrice) {
      setUnitPrice(String(selected.defaultPrice));
    }
  }, [itemCatalogId, items]);

  const resetForm = () => {
    setItemCatalogId("");
    setQuantity("1");
    setUnitPrice("");
  };

  const handleSubmit = async () => {
    if (!itemCatalogId) {
      toast.error("Selecione um item");
      return;
    }

    setLoading(true);

    try {
      await createMaintenanceItem(maintenanceId, {
        itemCatalogId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      });

      toast.success("Item adicionado");

      resetForm();

      onSuccess();

      onClose();
    } catch {
      toast.error("Erro ao adicionar item");
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
      title="Adicionar item"
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
        <PrimarySelect
          label="Item do catálogo"
          value={itemCatalogId}
          onChange={(val) => setItemCatalogId(val as string)}
          options={[
            { label: "Selecione um item", value: "" },
            ...items.map((i) => ({
              label: `${i.name} (${i.type === "PART" ? "Peça" : "Serviço"})`,
              value: i.id,
            })),
          ]}
        />

        <PrimaryInput
          label="Quantidade"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <PrimaryInput
          label="Preço unitário"
          type="number"
          step="0.01"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />

        {quantity && unitPrice && (
          <div className="text-sm text-muted">
            Total:{" "}
            <strong>
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
          </div>
        )}
      </div>
    </PrimaryModal>
  );
}