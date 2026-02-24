"use client";
import {
  UserPhone,
  getUserPhones,
  createUserPhone,
  updateUserPhone,
} from "@/services/usersTelephones.service";
import { Phone, Plus, Star } from "lucide-react";
import PrimarySwitch from "../form/primarySwitch";
import { User } from "@/services/users.service";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import { useEffect, useState } from "react";
import LoaderComp from "../loaderComp";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

export default function UserPhonesModal({ open, user, onClose }: Props) {
  const [phones, setPhones] = useState<UserPhone[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newPhone, setNewPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  // FORMAT PHONE
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4)
      return `+${digits.slice(0, 2)}(${digits.slice(2)}`;
    if (digits.length <= 9)
      return `+${digits.slice(0, 2)}(${digits.slice(2, 4)})${digits.slice(4)}`;
    return `+${digits.slice(0, 2)}(${digits.slice(
      2,
      4,
    )})${digits.slice(4, 9)}-${digits.slice(9)}`;
  };

  const rawPhone = newPhone.replace(/\D/g, "");
  const isValidPhone = rawPhone.length >= 12;

  // FETCH
  const fetchPhones = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserPhones({
        userId: user.id,
        limit: 100,
        page: 1,
      });

      setPhones(data.phones);
    } catch {
      toast.error("Erro ao carregar telefones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchPhones();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  // ADD
  const handleAddPhone = async () => {
    if (!isValidPhone || !user) {
      toast.error("Informe um telefone válido");
      return;
    }

    setAdding(true);
    try {
      await createUserPhone({
        userId: user.id,
        phone: rawPhone,
        isPrimary,
        isActive: true,
      });

      toast.success("Telefone adicionado");
      setNewPhone("");
      setIsPrimary(false);
      await fetchPhones();
    } catch {
      toast.error("Erro ao adicionar telefone");
    } finally {
      setAdding(false);
    }
  };

  // TOGGLE STATUS
  const handleToggleStatus = async (phone: UserPhone) => {
    setUpdatingId(phone.id);
    try {
      await updateUserPhone(phone.id, {
        isActive: !phone.isActive,
      });

      await fetchPhones();
    } catch {
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdatingId(null);
    }
  };

  // SET PRIMARY
  const handleSetPrimary = async (phone: UserPhone) => {
    setUpdatingId(phone.id);
    try {
      await updateUserPhone(phone.id, {
        isPrimary: true,
      });

      await fetchPhones();
    } catch {
      toast.error("Erro ao definir como principal");
    } finally {
      setUpdatingId(null);
    }
  };

  const footer = (
    <button
      onClick={handleAddPhone}
      disabled={!isValidPhone || adding}
      className="w-fit flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50"
    >
      <Plus size={16} />
      {adding ? "Adicionando..." : "Adicionar Telefone"}
    </button>
  );

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title="Gerenciar Telefones"
      description={user ? `${user.firstName} ${user.lastName}` : ""}
      footer={footer}
      size="md"
    >
      <div className="space-y-4 pt-2">
        {loading ? (
          <LoaderComp />
        ) : (
          <>
            {/* LISTA */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {phones.length === 0 ? (
                <p className="text-sm text-muted text-center">
                  Nenhum telefone cadastrado.
                </p>
              ) : (
                phones.map((phone) => (
                  <div
                    key={phone.id}
                    className={`flex justify-between items-center border rounded-lg p-3 transition-all ${
                      phone.isPrimary
                        ? "border-accent bg-accent/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Phone size={16} />

                      <span className="font-mono text-sm">
                        {phone.phone.replace(
                          /(\d{2})(\d{2})(\d{5})(\d{4})/,
                          "+$1($2)$3-$4",
                        )}
                      </span>

                      {phone.isPrimary && (
                        <Star size={14} className="text-yellow-500" />
                      )}

                      <span
                        className={`text-xs font-bold ${
                          phone.isActive
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {phone.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="flex gap-3 items-center text-xs">
                      {!phone.isPrimary && (
                        <button
                          disabled={updatingId === phone.id}
                          onClick={() => handleSetPrimary(phone)}
                          className="text-accent hover:underline disabled:opacity-50"
                        >
                          Principal
                        </button>
                      )}

                      <button
                        disabled={updatingId === phone.id}
                        onClick={() => handleToggleStatus(phone)}
                        className={`hover:underline disabled:opacity-50 ${
                          phone.isActive
                            ? "text-error"
                            : "text-success"
                        }`}
                      >
                        {updatingId === phone.id
                          ? "..."
                          : phone.isActive
                          ? "Desativar"
                          : "Ativar"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ADD NEW */}
            <div className="border-t border-border pt-4 space-y-3">
              <PrimaryInput
                label="Novo Telefone"
                value={formatPhone(newPhone)}
                onChange={(e) =>
                  setNewPhone(e.target.value)
                }
                placeholder="+55(16)99999-9999"
              />

              <PrimarySwitch
                label="Definir como principal"
                checked={isPrimary}
                onChange={setIsPrimary}
              />
            </div>
          </>
        )}
      </div>
    </PrimaryModal>
  );
}
