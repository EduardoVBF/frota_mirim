"use client";
import { getAdminUsers, User, UserFilters } from "@/services/users.service";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { UserTable } from "@/components/users/userTable";
import { useEffect, useState, useCallback } from "react";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";

export default function UsuariosPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<UserFilters>({
    search: "",
    role: undefined,
    isActive: undefined,
  });

  const [usersMeta, setUsersMeta] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAdminUsers(filter);
      setUsers(data.users);
      setUsersMeta(data.meta);
    } catch {
      setUsers([]);
      setUsersMeta({
        total: 0,
        active: 0,
        newThisMonth: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Gerenciamento de <span className="text-accent">Usuários</span>
          </h1>
          <p className="text-muted text-sm">
            Visualize, edite e controle as permissões da equipe.
          </p>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6">
              <StatsCard
                label="Total"
                value={usersMeta.total.toString()}
                icon={<Users />}
                iconColor="text-accent"
              />
              <StatsCard
                label="Ativos"
                value={usersMeta.active.toString()}
                icon={<UserCheck />}
                iconColor="text-success"
              />
              <StatsCard
                label="Novos no mês"
                value={usersMeta.newThisMonth.toString()}
                icon={<UserPlus />}
                iconColor="text-info"
              />
            </div>

            <UserTable
              users={users}
              // setUsers={setUsers}
              filter={filter}
              setFilter={setFilter}
              onUserChange={fetchUsers}
            />
          </>
        )}
      </div>
    </FadeIn>
  );
}
