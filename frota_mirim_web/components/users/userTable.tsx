"use client";
import { Edit2, Phone, Search, Filter } from "lucide-react";
import { StatusDot } from "../motion/statusDot";

const users = [
  { name: "Eduardo Freitas", email: "eduardo.freitas@email.com", role: "Administrador", status: "Ativo", date: "19/11/2025" },
  { name: "Cristian Nascimento", email: "cristian.nascimento@email.com", role: "Administrador", status: "Ativo", date: "19/11/2025" },
  { name: "João Silva", email: "joao.silva2@email.com", role: "Motorista", status: "Ativo", date: "18/11/2025" },
];

export function UserTable() {
  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      {/* Toolbar da Tabela */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg w-full max-w-sm">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Buscar por nome ou email..." className="bg-transparent outline-none text-sm w-full" />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors">
             <Filter size={16} /> Filtros
           </button>
           <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">
             + Cadastrar Usuário
           </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background/50 text-[10px] uppercase tracking-widest text-muted border-b border-border">
              <th className="px-6 py-4 font-bold">Nome</th>
              <th className="px-6 py-4 font-bold">Função</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Criado</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user, i) => (
              <tr key={i} className="group hover:bg-background/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{user.name}</span>
                    <span className="text-xs text-muted">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-background border border-border">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-success">
                    <StatusDot color="var(--success)" />
                    {user.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted">{user.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-muted hover:text-foreground hover:bg-background rounded-lg transition-all">
                      <Phone size={16} />
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