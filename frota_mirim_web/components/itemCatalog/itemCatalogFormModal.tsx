"use client";
import {
  createItemCatalog,
  updateItemCatalog,
  ItemCatalog,
  ItemType,
} from "@/services/itemCatalog.service";
import { translateApiErrors } from "@/utils/translateApiError";
import PrimarySelect from "../form/primarySelect";
import PrimarySwitch from "../form/primarySwitch";
import toast, { Toaster } from "react-hot-toast";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";

export default function ItemCatalogFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ItemCatalog;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ItemType>("PART");
  const [reference, setReference] = useState("");
  const [price, setPrice] = useState("");
  const [isStockItem, setIsStockItem] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setReference(initialData.reference || "");
      setPrice(initialData.defaultPrice?.toString() || "");
      setIsStockItem(initialData.isStockItem);
      setIsActive(initialData.isActive);
    } else {
      setName("");
      setType("PART");
      setReference("");
      setPrice("");
      setIsStockItem(false);
      setIsActive(true);
    }
  }, [initialData, open]);

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!name) {
      setErrors({ name: "O nome é obrigatório" });
      toast.error("Por favor, preencha os campos obrigatórios");
      setLoading(false);
      return;
    }

    if (type === "SERVICE" && isStockItem) {
      setErrors({ isStockItem: "Serviços não podem ser itens de estoque" });
      toast.error("Por favor, corrija os campos obrigatórios");
      setLoading(false);
      return;
    }

    try {
      if (initialData) {
        await updateItemCatalog(initialData.id, {
          name,
          type,
          reference,
          defaultPrice: price ? Number(price) : undefined,
          isStockItem,
          isActive,
        });

        toast.success("Item atualizado!");
      } else {
        await createItemCatalog({
          name,
          type,
          reference,
          defaultPrice: price ? Number(price) : undefined,
          isStockItem,
          isActive,
        });

        toast.success("Item criado!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar");
        return;
      }

      if (!err.response?.data) {
        toast.error("Erro ao salvar");
        return;
      }

      const { fieldErrors, toastMessage } = translateApiErrors(
        err.response.data,
      );

      setErrors(fieldErrors);
      toast.error(toastMessage || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title="Item do Catálogo"
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
      <Toaster />

      <div className="space-y-4">
        <PrimaryInput
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name || ""}
        />

        <PrimarySelect
          label="Tipo"
          value={type}
          onChange={(v) => setType(v as ItemType)}
          options={[
            { label: "Peça", value: "PART" },
            { label: "Serviço", value: "SERVICE" },
          ]}
        />

        <PrimaryInput
          label="Referência"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <PrimaryInput
          label="Preço padrão"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <PrimarySwitch
          label="Item de estoque"
          checked={isStockItem && type !== "SERVICE"}
          onChange={setIsStockItem}
          disabled={type === "SERVICE"}
        />

        <PrimarySwitch
          label="Item ativo"
          checked={isActive}
          onChange={setIsActive}
        />
      </div>
    </PrimaryModal>
  );
}
