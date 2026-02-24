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
import {
  Edit2,
  Phone,
  Search,
  Filter,
  FilterX,
  UserPlus,
  Key,
} from "lucide-react";
import ResetPasswordModal from "./resetPasswordModal";
import FilterChips from "../fuel-supply/FilterChips";
import toast, { Toaster } from "react-hot-toast";
import { StatusDot } from "../motion/statusDot";
import UserFormModal from "./userFormModal";
import ImageZoom from "../layout/ImageZoom";
import LoaderComp from "../loaderComp";
import { useState } from "react";

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

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.role?.length ? 1 : 0) +
    (filters.isActive !== undefined ? 1 : 0);

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

  const handleClearFilters = () => {
    setFilters({
      search: "",
      role: undefined,
      isActive: undefined,
    });
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <Toaster />

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

      <ResetPasswordModal
        open={resetOpen}
        loading={loading}
        user={resetUser}
        onClose={() => setResetOpen(false)}
        onSubmit={handleResetPassword}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
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

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <>
                <FilterX size={16} /> Filtros
              </>
            ) : (
              <>
                <Filter size={16} /> Filtros
              </>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
              {activeFiltersCount} filtro(s)
            </span>
          )}

          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20"
          >
            <UserPlus size={18} /> Cadastrar Usuário
          </button>
        </div>
      </div>

      {/* FILTROS */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-border bg-background/40 flex flex-wrap gap-4 items-end">
          <FilterChips
            label="Status"
            value={
              filters.isActive === undefined
                ? ""
                : filters.isActive
                  ? "true"
                  : "false"
            }
            onChange={(value) =>
              setFilters({
                ...filters,
                isActive:
                  filters.isActive?.toString() === value
                    ? undefined
                    : value === "true"
                      ? true
                      : value === "false"
                        ? false
                        : undefined,
              })
            }
            options={[
              { label: "Ativo", value: "true" },
              { label: "Inativo", value: "false" },
            ]}
          />

          <FilterChips
            label="Função"
            multi
            value={filters.role || []}
            onChange={(value) =>
              setFilters({
                ...filters,
                role: value.length ? value : undefined,
              })
            }
            options={[
              { label: "Admin", value: "admin" },
              { label: "Editor", value: "editor" },
              { label: "Motorista", value: "motorista" },
            ]}
          />

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="ml-auto px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              {/* <th className="px-6 py-4 font-bold text-center w-16">#</th> */}
              <th className="px-6 py-4 font-bold">Usuário</th>
              <th className="px-6 py-4 font-bold">CPF</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user?.imageUrl ? (
                        <ImageZoom
                          src={user.imageUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          width={32}
                          height={32}
                          primaryImageClassName="w-8 h-8 rounded-full object-cover border border-accent"
                          zoom
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center uppercase border border-accent">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-muted tracking-wide">
                      {user.cpf.replace(/(\d{3})\d{6}(\d{2})/, "$1******$2")}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-background border border-border text-muted">
                      {user.role}
                    </span>
                  </td>

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

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg">
                        <Phone size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setResetUser(user);
                          setResetOpen(true);
                        }}
                        className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg"
                      >
                        <Key size={18} />
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
