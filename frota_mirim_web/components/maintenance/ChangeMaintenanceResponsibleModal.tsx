"use client";
import {
  updateMaintenanceHistoryResponsible,
  MaintenanceHistory,
} from "@/services/maintenanceHistory.service";
import { getAdminUsers, User } from "@/services/users.service";
import { translateApiErrors } from "@/utils/translateApiError";
import PrimarySelect from "@/components/form/primarySelect";
import PrimaryModal from "@/components/form/primaryModal";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;

  history: MaintenanceHistory; // item do histórico que será alterado
};

export default function ChangeMaintenanceResponsibleModal({
  open,
  onClose,
  onSuccess,
  history,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [responsibleUserId, setResponsibleUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* INITIAL */
  useEffect(() => {
    if (open && history?.responsibleUserId) {
      setResponsibleUserId(history.responsibleUserId);
    } else {
      setResponsibleUserId("");
    }
  }, [open, history]);

  /* FETCH USERS */
  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAdminUsers({ page: 1, limit: 1000 });
      setUsers(data.users);
    } catch {
      toast.error("Erro ao buscar usuários");
    }
  }, []);

  useEffect(() => {
    if (open) fetchUsers();
  }, [open, fetchUsers]);

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!responsibleUserId) {
      toast.error("Selecione um responsável");
      return;
    }

    setLoading(true);

    try {
      await updateMaintenanceHistoryResponsible(history.id, responsibleUserId);

      toast.success("Responsável atualizado com sucesso!");

      onSuccess();
      handleClose();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao atualizar responsável");
      } else {
        toast.error("Erro ao atualizar responsável");
      }
    } finally {
      setLoading(false);
    }
  };

  /* CLOSE */
  const handleClose = () => {
    setResponsibleUserId("");
    setErrors({});
    onClose();
  };

  return (
    <PrimaryModal
      isOpen={open}
      onClose={handleClose}
      title="Alterar responsável da manutenção"
      minHeight="min-h-fit"
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

      <div className="space-y-4 mb-40">
        <PrimarySelect
          searchable
          label="Responsável"
          value={responsibleUserId}
          onChange={(val) => setResponsibleUserId(val as string)}
          options={users.map((u) => ({
            label: `${u.firstName} ${u.lastName}`,
            value: u.id,
          }))}
          error={errors.responsibleUserId}
        />

        {history && history.responsibleUserId && (
          <p className="text-xs text-muted">
            Responsável atual:{" "}
            <strong>
              {users.find((u) => u.id === history.responsibleUserId)
                ? `${users.find((u) => u.id === history.responsibleUserId)?.firstName} ${
                    users.find((u) => u.id === history.responsibleUserId)
                      ?.lastName
                  }`
                : "Desconecido"}
            </strong>
          </p>
        )}
      </div>
    </PrimaryModal>
  );
}
