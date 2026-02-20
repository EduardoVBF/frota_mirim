"use client";
import { getAdminUsers, User, UserFilters } from "@/services/users.service";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { UserTable } from "@/components/users/userTable";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import dayjs from "dayjs";

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        limit: 1000,
        page: 1,
      });

      setUsers(data.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const processedData = useMemo(() => {
    const filtered = users.filter((user) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !`${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search) &&
          !user.email.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (filters.role) {
        if (!filters.role.includes(user.role)) return false;
      }

      if (filters.isActive !== undefined) {
        if (user.isActive !== filters.isActive) return false;
      }

      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;

    const activeCount = users.filter((u) => u.isActive).length;

    const newThisMonth = users.filter((u) =>
      dayjs(u.createdAt).isSame(dayjs(), "month")
    ).length;

    return {
      data: filtered.slice(start, end),
      total: users.length,
      totalFiltered: filtered.length,
      active: activeCount,
      newThisMonth,
    };
  }, [users, filters, page]);

  const totalPages = Math.ceil(processedData.totalFiltered / limit);

  useEffect(() => {
    setPage(1);
  }, [filters]);

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
              value={processedData.total.toString()}
              icon={<Users />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Ativos"
              value={processedData.active.toString()}
              icon={<UserCheck />}
              iconColor="text-success"
            />
            <StatsCard
              label="Novos no mês"
              value={processedData.newThisMonth.toString()}
              icon={<UserPlus />}
              iconColor="text-info"
            />
          </div>
        )}

        <UserTable
          users={processedData.data}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onUserChange={fetchUsers}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}