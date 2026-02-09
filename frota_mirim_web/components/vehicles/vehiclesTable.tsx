"use client";
import { Search, Plus, Edit3 } from "lucide-react";
import Link from "next/link";

const vehicles = [
  {
    placa: "BSR-9B03",
    modelo: "Opala",
    marca: "Ferrari",
    ano: "1900",
    tipo: "Carro",
    motorista: "Bruno1 Jklkl",
  },
  {
    placa: "ABC1D21",
    modelo: "Civic",
    marca: "Fiat",
    ano: "2025",
    tipo: "Carro",
    motorista: "Brunão João",
  },
  {
    placa: "ABC1D23",
    modelo: "Strada",
    marca: "Fiat",
    ano: "2022",
    tipo: "Caminhão",
    motorista: "Bruno Algarte",
  },
];

export function VehicleTable() {
  return (
    <div className="my-3 rounded-2xl border border-border bg-alternative-bg overflow-hidden shadow-sm">
      {/* Header da Tabela */}
      <div className="p-5 border-b border-border bg-alternative-bg/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">Frota Ativa</h2>
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase">
            3 Unidades
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar placa, modelo..."
              className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-accent/50 w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-accent/20">
            <Plus size={18} /> Cadastrar Veículo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.15em] text-muted border-b border-border bg-background/30">
              <th className="px-6 py-4 font-bold">Placa</th>
              <th className="px-6 py-4 font-bold">Modelo / Marca</th>
              <th className="px-6 py-4 font-bold">Ano</th>
              <th className="px-6 py-4 font-bold">Tipo</th>
              <th className="px-6 py-4 font-bold">Motorista Responsável</th>
              <th className="px-6 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vehicles.map((v, i) => (
              <tr
                key={i}
                className="group hover:bg-background/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link href={`/veiculos/${v.placa}`}>
                    <span className="font-mono text-sm font-bold bg-background border border-border px-2 py-1 rounded text-foreground cursor-pointer">
                      {v.placa}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {v.modelo}
                    </span>
                    <span className="text-xs text-muted">{v.marca}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-muted">
                  {v.ano}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-alternative-bg border border-border text-muted group-hover:border-accent/30 group-hover:text-accent transition-all">
                    {v.tipo}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent border border-accent/20">
                      {v.motorista.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground/80">
                      {v.motorista}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
