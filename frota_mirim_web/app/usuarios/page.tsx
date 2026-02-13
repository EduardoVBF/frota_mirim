"use client";
import { getAdminUsers, User, UserFilters } from "@/services/users.service";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { UserTable } from "@/components/users/userTable";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";

export default function UsuariosPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: undefined,
    isActive: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 5;

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    active: 0,
    newThisMonth: 0,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAdminUsers({
        ...filters,
        page,
        limit,
      });

      setUsers(data.users);
      setMeta(data.meta);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Gerenciamento de <span className="text-accent">Usuários</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total"
              value={meta.total.toString()}
              icon={<Users />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Ativos"
              value={meta.active.toString()}
              icon={<UserCheck />}
              iconColor="text-success"
            />
            <StatsCard
              label="Novos no mês"
              value={meta.newThisMonth.toString()}
              icon={<UserPlus />}
              iconColor="text-info"
            />
          </div>
        )}

        <UserTable
          users={users}
          isLoading={loading}
          filters={filters}
          setFilters={(newFilters) => {
            setPage(1);
            setFilters(newFilters);
          }}
          onUserChange={fetchUsers}
        />

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}
