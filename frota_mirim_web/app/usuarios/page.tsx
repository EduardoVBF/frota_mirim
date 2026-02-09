import { Users, UserCheck, UserPlus } from "lucide-react";
import { UserTable } from "@/components/users/userTable";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";

export default function UsuariosPage() {
  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Header da Página */}
        <header className="mb-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gerenciamento de <span className="text-accent">Usuários</span>
          </h1>
          <p className="text-muted mt-1 text-xs">
            Visualize, edite e controle as permissões de acesso da sua equipe.
          </p>
        </header>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-6 my-3">
          <StatsCard
            label="Total de Usuários"
            value="3"
            icon={<Users />}
            iconColor="text-accent"
          />

          <StatsCard
            label="Usuários Ativos"
            value="3"
            icon={<UserCheck />}
            iconColor="text-success"
          />

          <StatsCard
            label="Novos no mês"
            value="3"
            icon={<UserPlus />}
            iconColor="text-info"
          />
        </div>

        {/* Tabela Principal */}
        <UserTable />
      </div>
    </FadeIn>
  );
}
