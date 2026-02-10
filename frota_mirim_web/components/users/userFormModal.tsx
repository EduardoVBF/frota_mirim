"use client";
import PrimarySelect from "../form/primarySelect";
import PrimarySwitch from "../form/primarySwitch";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import { useState } from "react";

type User = {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserFormModal({
  isOpen,
  onClose,
  userToEdit,
}: UserFormModalProps) {
  
  const [formData, setFormData] = useState({
    name: userToEdit?.name || "",
    email: userToEdit?.email || "",
    role: userToEdit?.role || "",
    isActive: userToEdit?.isActive ?? true,
  });

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2 text-sm font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="user-form"
        className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        {userToEdit ? "Salvar Alterações" : "Cadastrar Usuário"}
      </button>
    </>
  );

  return (
    <PrimaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? "Editar Usuário" : "Novo Usuário"}
      description={userToEdit ? "Atualize os dados do usuário" : "Crie um novo acesso de usuário para a equipe"}
      footer={footer}
      size="md"
    >
      <form
        id="user-form"
        onSubmit={(e) => {
          e.preventDefault();
          console.log(formData);
        }}
        className="space-y-6"
      >
        <PrimaryInput
          label="Nome Completo"
          placeholder="Digite o nome completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <PrimaryInput
          label="E-mail"
          placeholder="Digite o e-mail"

          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <PrimarySelect
          label="Função / Cargo"
          placeholder="Selecione a função ou cargo"
          value={formData.role}
          onChange={(val) => setFormData({ ...formData, role: val })}
          options={[
            { label: "Administrador", value: "Administrador" },
            { label: "Motorista", value: "Motorista" },
          ]}
        />
        <PrimarySwitch
          label="Acesso Ativo"
          checked={formData.isActive}
          onChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </form>
    </PrimaryModal>
  );
}