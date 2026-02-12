"use client";
import {
  User,
  getAdminUsers,
  createUser,
  updateUser,
  CreateUserPayload,
  UpdateUserPayload,
  resetUserPassword,
} from "@/services/users.service";
import { Edit2, Phone, Search, Filter, UserPlus, Key } from "lucide-react";
import ResetPasswordModal from "./resetPasswordModal";
import toast, { Toaster } from "react-hot-toast";
import { StatusDot } from "../motion/statusDot";
import { useState, useEffect } from "react";
import UserFormModal from "./userFormModal";

export function UserTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(() => toast.error("Erro ao carregar usuários"))
      .finally(() => setLoading(false));
  }, []);

  const handleFormSubmit = async (data: Partial<User>) => {
    setLoading(true);
    try {
      if (editingUser) {
        const updated = await updateUser(
          editingUser.id,
          data as UpdateUserPayload,
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u)),
        );
        toast.success("Usuário atualizado");
      } else {
        const created = await createUser(data as CreateUserPayload);
        setUsers((prev) => [created, ...prev]);
        toast.success("Usuário criado");
      }

      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!resetUser) return;
    setLoading(true);
    try {
      await resetUserPassword(resetUser.id, { newPassword });
      toast.success("Senha redefinida");
      setResetOpen(false);
      setResetUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <Toaster />
      {/* Modal de cadastro/edição */}
      <UserFormModal
        key={editingUser ? `edit-${editingUser.id}` : "new-user"}
        open={isModalOpen}
        onSubmit={handleFormSubmit}
        loading={loading}
        initialData={editingUser || undefined}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal de reset de senha */}
      <ResetPasswordModal
        open={resetOpen}
        loading={loading}
        user={resetUser}
        onClose={() => setResetOpen(false)}
        onSubmit={handleResetPassword}
      />

      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm focus-within:border-accent/50 transition-all">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors">
            <Filter size={16} /> Filtros
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
          >
            <UserPlus size={18} /> Cadastrar Usuário
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <th className="px-6 py-4 font-bold text-center w-16">#</th>
              <th className="px-6 py-4 font-bold">Usuário</th>
              <th className="px-6 py-4 font-bold">Função</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user, i) => (
              <tr
                key={i}
                className="group hover:bg-background/50 transition-colors"
              >
                <td className="px-6 py-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center mx-auto uppercase">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-muted">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-background border border-border text-muted">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`flex items-center gap-2 text-xs font-bold ${user.isActive ? "text-success" : "text-error"}`}
                  >
                    <StatusDot
                      color={user.isActive ? "var(--success)" : "var(--error)"}
                    />
                    {user.isActive ? "Ativo" : "Inativo"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                      title="Editar usuário"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                      <Phone size={16} />
                    </button>
                    {/* RESET SENHA */}
                    <button
                      onClick={() => {
                        setResetUser(user);
                        setResetOpen(true);
                      }}
                      className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                      title="Redefinir senha"
                    >
                      <Key size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
