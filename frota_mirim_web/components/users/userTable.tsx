"use client";
import {
  User,
  createUser,
  updateUser,
  CreateUserPayload,
  UpdateUserPayload,
  resetUserPassword,
  UserFilters,
} from "@/services/users.service";
import { Edit2, Phone, Search, Filter, UserPlus, Key } from "lucide-react";
import DynamicFilters, { FilterConfig } from "../dinamicFilters";
import ResetPasswordModal from "./resetPasswordModal";
import toast, { Toaster } from "react-hot-toast";
import { StatusDot } from "../motion/statusDot";
import UserFormModal from "./userFormModal";
import LoaderComp from "../loaderComp";
import { useState } from "react";
import ImageZoom from "../layout/ImageZoom";

export function UserTable({
  users,
  isLoading,
  filters,
  setFilters,
  onUserChange,
}: {
  users: User[];
  filters: UserFilters;
  setFilters: React.Dispatch<React.SetStateAction<UserFilters>>;
  onUserChange: () => void;
  isLoading: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<User>) => {
    setLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data as UpdateUserPayload);
        toast.success("Usuário atualizado");
      } else {
        await createUser(data as CreateUserPayload);
        toast.success("Usuário criado");
      }

      setIsModalOpen(false);
      setEditingUser(null);

      // refresh manual para garantir que dados estejam atualizados
      await onUserChange();
    } catch {
      toast.error("Erro ao salvar usuário");
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

      onUserChange();
    } catch {
      toast.error("Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  const userFilterConfigs: FilterConfig[] = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { label: "Ativos", value: true },
        { label: "Inativos", value: false },
      ],
    },
    {
      key: "role",
      label: "Função",
      multi: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Motorista", value: "motorista" },
      ],
    },
  ];

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
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          setLoading(false);
        }}
      />

      {/* Modal de reset de senha */}
      <ResetPasswordModal
        open={resetOpen}
        loading={loading}
        user={resetUser}
        onClose={() => setResetOpen(false)}
        onSubmit={handleResetPassword}
      />

      <div>
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm focus-within:border-accent/50 transition-all">
            <Search size={18} className="text-muted" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Buscar por nome ou email..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
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

        {showFilters && (
          <DynamicFilters
            configs={userFilterConfigs}
            filters={filters}
            setFilters={setFilters}
            onClear={() =>
              setFilters({
                search: "",
                role: undefined,
                isActive: undefined,
              })
            }
          />
        )}
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

          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <LoaderComp />
                </td>
              </tr>
            </tbody>
          ) : users.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="group hover:bg-background/50 transition-colors"
                >
                  {/* Avatar */}
                  <td className="px-6 py-4 text-center">
                    {user?.imageUrl ? (
                      <ImageZoom
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={32}
                        height={32}
                        primaryImageClassName="w-8 h-8 rounded-full object-cover"
                        zoom
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center mx-auto uppercase">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                    )}
                  </td>

                  {/* Nome + Email */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-muted">{user.email}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-background border border-border text-muted">
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-2 text-xs font-bold ${
                        user.isActive ? "text-success" : "text-error"
                      }`}
                    >
                      <StatusDot
                        color={
                          user.isActive ? "var(--success)" : "var(--error)"
                        }
                      />
                      {user.isActive ? "Ativo" : "Inativo"}
                    </div>
                  </td>

                  {/* Actions */}
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
          )}
        </table>
      </div>
    </div>
  );
}
