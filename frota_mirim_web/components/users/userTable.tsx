"use client";
import { useState } from "react";
import { Edit2, Phone, Search, Filter, UserPlus } from "lucide-react";
import { StatusDot } from "../motion/statusDot";
import { UserFormModal } from "./userFormModal";

type User = {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  date: string;
};

const users = [
  {
    name: "Eduardo Freitas",
    email: "eduardo.freitas@email.com",
    role: "Administrador",
    isActive: true,
    date: "19/11/2025",
  },
  {
    name: "Cristian Nascimento",
    email: "cristian.nascimento@email.com",
    role: "Administrador",
    isActive: true,
    date: "19/11/2025",
  },
  {
    name: "João Silva",
    email: "joao.silva2@email.com",
    role: "Motorista",
    isActive: true,
    date: "18/11/2025",
  },
];

export function UserTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      {/* Modal Renderizado aqui */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        key={selectedUser ? `edit-${selectedUser.email}` : "create"}
        userToEdit={selectedUser}
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
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center mx-auto">
                    {user.name.charAt(0)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {user.name}
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
                  <div className="flex items-center gap-2 text-xs font-bold text-success">
                    <StatusDot color="var(--success)" />
                    {user.isActive ? "Ativo" : "Inativo"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                    >
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
