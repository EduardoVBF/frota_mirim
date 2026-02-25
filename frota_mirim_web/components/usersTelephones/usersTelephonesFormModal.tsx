"use client";
import {
  UserPhone,
  CreateUserPhonePayload,
} from "@/services/usersTelephones.service";
import { User, getAdminUsers } from "@/services/users.service";
import React, { useEffect, useState } from "react";
import PrimarySwitch from "../form/primarySwitch";
import PrimarySelect from "../form/primarySelect";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import LoaderComp from "../loaderComp";

type Props = {
  open: boolean;
  loading: boolean;
  initialData?: UserPhone | null;
  onClose: () => void;
  onSubmit: (data: CreateUserPhonePayload) => void;
  errors: Record<string, string>;
};

export default function UserPhoneFormModal({
  open,
  loading = false,
  initialData,
  onClose,
  onSubmit,
  errors,
}: Props) {
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

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

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhone(initialData.phone);
      setUserId(initialData.userId);
      setIsPrimary(initialData.isPrimary);
      setIsActive(initialData.isActive);
    } else {
      setPhone("");
      setUserId("");
      setIsPrimary(false);
      setIsActive(true);
    }
  }, [initialData, open]);

  // Get de usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAdminUsers({ limit: 1000, page: 1 });
        setUsers(data.users);
      } catch {
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await onSubmit({
      phone,
      userId,
      isPrimary,
      isActive,
    });
  }

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2 text-sm font-bold text-muted"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="phone-form"
        disabled={loading}
        className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold"
      >
        {loading
          ? "Salvando..."
          : initialData
            ? "Salvar Alterações"
            : "Cadastrar Telefone"}
      </button>
    </>
  );

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title={initialData ? "Editar Telefone" : "Novo Telefone"}
      description="Cadastre ou edite um telefone do sistema."
      footer={footer}
      size="md"
    >
      {loading ? (
        <LoaderComp />
      ) : (
        <form id="phone-form" onSubmit={handleSubmit} className="space-y-4">
          <PrimarySelect
            label="Usuário"
            value={userId}
            onChange={(val) => setUserId(val)}
            options={users.map((user) => ({
              label: user.firstName + " " + user.lastName,
              value: user.id,
            }))}
          />

          <PrimaryInput
            label="Número Telefone"
            value={formatPhone(phone)}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+55(16)99999-9999"
            error={errors.phone}
          />

          <div className="flex items-center gap-6">
            <PrimarySwitch
              label="Principal"
              checked={isPrimary}
              onChange={setIsPrimary}
              error={errors.isPrimary}
            />
            <PrimarySwitch
              label="Ativo"
              checked={isActive}
              onChange={setIsActive}
              error={errors.isActive}
            />
          </div>
        </form>
      )}
    </PrimaryModal>
  );
}
