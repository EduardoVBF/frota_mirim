"use client";
import { translateApiErrors } from "../../utils/translateApiError";
import { User, UserPayload } from "../../services/users.service";
import React, { useEffect, useState } from "react";
import PrimarySelect from "../form/primarySelect";
import PrimarySwitch from "../form/primarySwitch";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import ColoredTextBox from "../coloredTextBox";
import ImageInput from "../form/imageInput";
import { toast } from "react-hot-toast";
import LoaderComp from "../loaderComp";
import { AxiosError } from "axios";

type Props = {
  open: boolean;
  loading: boolean;
  initialData?: User | null;
  onClose: () => void;
  onSubmit: (data: UserPayload) => void;
  errors: Record<string, string>;
};

export default function UserFormModal({
  open,
  loading = false,
  initialData,
  onClose,
  onSubmit,
  errors,
}: Props) {
  const [infoVisible, setInfoVisible] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "motorista" | "editor">("admin");
  const [isActive, setIsActive] = useState(true);
  const [cpf, setCpf] = useState("");

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [cnhExpiresAt, setCnhExpiresAt] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setRole(initialData.role);
      setIsActive(initialData.isActive);
      setPassword("");
      setCpf(initialData.cpf || "");

      setCnhExpiresAt(
        initialData.cnhExpiresAt
          ? new Date(initialData.cnhExpiresAt).toISOString().split("T")[0]
          : "",
      );
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("admin");
      setIsActive(true);
      setImageBase64(null);
      setCnhExpiresAt("");
      setCpf("");
    }
  }, [initialData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await onSubmit({
        firstName,
        lastName,
        email,
        role,
        isActive,
        cpf,
        ...(initialData ? {} : { password }),
        ...(imageBase64 && { imageBase64 }),
        ...(cnhExpiresAt && { cnhExpiresAt }),
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const { toastMessage } = translateApiErrors(
          err.response.data,
        );
        toast.error(toastMessage || "Erro ao salvar usuário");
      } else {
        toast.error("Erro inesperado ao salvar");
      }
    }
  }

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
        disabled={loading}
        className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
      >
        {loading
          ? "Salvando..."
          : initialData
            ? "Salvar Alterações"
            : "Cadastrar Usuário"}
      </button>
    </>
  );

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title={initialData ? "Editar Usuário" : "Novo Usuário"}
      description={
        initialData
          ? "Atualize os dados e permissões."
          : "Crie um novo acesso para a equipe."
      }
      footer={footer}
      size="md"
      infoVisible={infoVisible}
      setInfoVisible={setInfoVisible}
    >
      <div className="space-y-4 pt-2">
        {infoVisible && (
          <ColoredTextBox type="info" className="mb-4">
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li>O e-mail não pode ser alterado após o cadastro.</li>
              <li>A senha é necessária apenas para novos usuários.</li>
              <li>Administradores têm acesso total às configurações.</li>
              <li>Motoristas devem possuir CNH válida.</li>
            </ul>
          </ColoredTextBox>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <LoaderComp text="Processando..." />
          </div>
        ) : (
          <form
            id="user-form"
            onSubmit={handleSubmit}
            className={`space-y-4 ${
              loading ? "opacity-50 pointer-events-none" : ""
            }`}
            autoComplete="off"
          >
            <div className="flex justify-center">
              <ImageInput
                value={initialData?.imageUrl || null}
                onChange={setImageBase64}
                error={errors.imageBase64}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PrimaryInput
                label="Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
              />
              <PrimaryInput
                label="Sobrenome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
              />
            </div>

            <PrimaryInput
              label="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              error={errors.cpf}
            />

            <PrimaryInput
              type="text"
              name="new-email"
              autoComplete="new-email"
              label="E-mail"
              value={email}
              disabled={!!initialData}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            {!initialData && (
              <PrimaryInput
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                name="new-password"
                autoComplete="new-password"
              />
            )}

            <PrimaryInput
              label="Vencimento da CNH"
              type="date"
              value={cnhExpiresAt}
              onChange={(e) => setCnhExpiresAt(e.target.value)}
              error={errors.cnhExpiresAt}
            />

            <PrimarySelect
              label="Cargo"
              value={role}
              onChange={(val) =>
                setRole(val as "admin" | "motorista" | "editor")
              }
              options={[
                { label: "Administrador", value: "admin" },
                { label: "Motorista", value: "motorista" },
                { label: "Editor", value: "editor" },
              ]}
            />

            <PrimarySwitch
              label="Ativo"
              checked={isActive}
              onChange={setIsActive}
            />
          </form>
        )}
      </div>
    </PrimaryModal>
  );
}
