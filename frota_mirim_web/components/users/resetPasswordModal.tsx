"use client";
import { translateApiErrors } from "../../utils/translateApiError";
import { User } from "../../services/users.service";
import PrimaryInput from "../form/primaryInput";
import LoaderComp from "../loaderComp";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import PrimaryModal from "../form/primaryModal";
import ColoredTextBox from "../coloredTextBox";

type Props = {
  open: boolean;
  loading: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  errors: Record<string, string>;
};

export default function ResetPasswordModal({
  open,
  loading,
  user,
  onClose,
  onSubmit,
  errors,
}: Props) {
  const [infoVisible, setInfoVisible] = useState(false);
  const [password, setPassword] = useState("");

  if (!open || !user) return null;

  function handleClose() {
    onClose();
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await onSubmit(password);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao redefinir senha");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao redefinir senha");
          return;
        }
        const { toastMessage } = translateApiErrors(
          err.response.data,
        );

        toast.error(toastMessage || "Erro ao redefinir senha");
      }
    } finally {
      setPassword("");
    }
  }

  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="px-6 py-2 text-sm font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="reset-password-form"
        disabled={loading}
        className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
      >
        Redefinir Senha
      </button>
    </>
  );

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title={`Redefinir senha`}
      description={`Defina uma nova senha para ${user.firstName} ${user.lastName} (${user.email})`}
      footer={footer}
      infoVisible={infoVisible}
      setInfoVisible={setInfoVisible}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <LoaderComp />
        </div>
      ) : (
        <>
          {infoVisible && (
            <ColoredTextBox type="info" className="mb-4">
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>A senha deve conter no mínimo 8 caracteres.</li>
                <li>
                  Recomenda-se usar uma combinação de letras, números e símbolos
                  para maior segurança.
                </li>
              </ul>
            </ColoredTextBox>
          )}

          <form
            id="reset-password-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <PrimaryInput
              label="Nova Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.newPassword}
              disabled={loading}
            />
          </form>
        </>
      )}
    </PrimaryModal>
  );
}
