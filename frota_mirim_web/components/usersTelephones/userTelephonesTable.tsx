"use client";
import {
  UserPhone,
  createUserPhone,
  updateUserPhone,
  CreateUserPhonePayload,
  UpdateUserPhonePayload,
  UserPhoneFilters,
} from "@/services/usersTelephones.service";
import { Edit2, Search, Filter, FilterX, Plus, Star } from "lucide-react";
import { User, getAdminUsers } from "@/services/users.service";
import { translateApiErrors } from "@/utils/translateApiError";
import UserPhoneFormModal from "./usersTelephonesFormModal";
import FilterChips from "../fuel-supply/FilterChips";
import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { StatusDot } from "../motion/statusDot";
import ImageZoom from "../layout/ImageZoom";
import LoaderComp from "../loaderComp";
import { AxiosError } from "axios";

export function UserPhoneTable({
  phones,
  isLoading,
  filters,
  setFilters,
  onPhoneChange,
}: {
  phones: UserPhone[];
  filters: UserPhoneFilters & {
    search?: string;
    isPrimary?: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<
      UserPhoneFilters & { search?: string; isPrimary?: boolean }
    >
  >;
  onPhoneChange: () => void;
  isLoading: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPhone, setEditingPhone] = useState<UserPhone | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAdminUsers({
          limit: 1000,
          page: 1,
        });
        setUsers(data.users);
      } catch {
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const displayedPhones = useMemo(() => {
    if (!filters.search) return phones;

    const search = filters.search.toLowerCase();

    return phones.filter((phone) => {
      const user = users.find((u) => u.id === phone.userId);

      const matchPhone = phone.phone.toLowerCase().includes(search);

      const matchUser =
        user &&
        (user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search));

      return matchPhone || matchUser;
    });
  }, [phones, filters.search, users]);

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.isActive !== undefined ? 1 : 0) +
    (filters.isPrimary !== undefined ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      ...filters,
      search: "",
      isActive: undefined,
      isPrimary: undefined,
    });
  };

  const handleFormSubmit = async (data: CreateUserPhonePayload) => {
    setLoading(true);
    try {
      if (editingPhone) {
        await updateUserPhone(editingPhone.id, data as UpdateUserPhonePayload);
        toast.success("Telefone atualizado");
      } else {
        await createUserPhone(data);
        toast.success("Telefone criado");
      }

      setIsModalOpen(false);
      setEditingPhone(null);
      await onPhoneChange();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar telefone");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao salvar telefone");
          return;
        }
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar telefone");
      }
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE STATUS
  const handleToggleStatus = async (phone: UserPhone) => {
    setEditingPhone(phone);
    try {
      await updateUserPhone(phone.id, {
        isActive: !phone.isActive,
      });
      toast.success(
        `Telefone ${!phone.isActive ? "ativado" : "desativado"} com sucesso`,
      );
      await onPhoneChange();
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao atualizar status");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao atualizar status");
          return;
        }
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );

        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao atualizar status");
      }
    } finally {
      setEditingPhone(null);
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <Toaster />

      <UserPhoneFormModal
        key={editingPhone ? `edit-${editingPhone.id}` : "new-phone"}
        open={isModalOpen}
        onSubmit={handleFormSubmit}
        loading={loading}
        initialData={editingPhone || undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPhone(null);
          setErrors({});
        }}
        errors={errors}
      />

      {/* HEADER */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder="Buscar usuário ou telefone..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg"
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
              setEditingPhone(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            <Plus size={18} /> Cadastrar Telefone
          </button>
        </div>
      </div>

      {/* FILTERS */}
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
            label="Principal"
            value={
              filters.isPrimary === undefined
                ? ""
                : filters.isPrimary
                  ? "true"
                  : "false"
            }
            onChange={(value) =>
              setFilters({
                ...filters,
                isPrimary:
                  filters.isPrimary?.toString() === value
                    ? undefined
                    : value === "true"
                      ? true
                      : value === "false"
                        ? false
                        : undefined,
              })
            }
            options={[
              { label: "Principal", value: "true" },
              { label: "Não Principal", value: "false" },
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
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Número</th>
              <th className="px-6 py-4">Principal</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <LoaderComp />
                </td>
              </tr>
            ) : displayedPhones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  Nenhum telefone encontrado.
                </td>
              </tr>
            ) : (
              displayedPhones.map((phone) => {
                const user = users.find((u) => u.id === phone.userId);

                return (
                  <tr key={phone.id}>
                    <td className="px-6 py-4">
                      {user ? (
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
                            <span className="text-xs text-muted">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-muted">
                          Usuário não encontrado
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {phone.phone.replace(
                        /(\d{2})(\d{2})(\d{5})(\d{4})/,
                        "+$1($2)$3-$4",
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {phone.isPrimary && (
                        <Star size={16} className="text-yellow-500" />
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 text-xs font-bold ${
                          phone.isActive ? "text-success" : "text-error"
                        }`}
                      >
                        <StatusDot
                          color={
                            phone.isActive ? "var(--success)" : "var(--error)"
                          }
                        />
                        {phone.isActive ? "Ativo" : "Inativo"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPhone(phone);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-muted hover:text-accent"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(phone)}
                        className={`cursor-pointer text-xs hover:underline disabled:opacity-50 ${
                          phone.isActive ? "text-error" : "text-success"
                        }`}
                      >
                        {phone.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
