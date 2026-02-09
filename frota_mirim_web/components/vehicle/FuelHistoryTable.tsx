"use client";
import { CheckCircle2, MoreVertical, MapPin, Fuel } from "lucide-react";

const abastecimentos = [
  { data: "17/08/2026 16:08", km: "470.347 km", valor: "R$ 266,76", litros: "41,23 L", local: "Texaco", media: "6.52 km/L" },
  { data: "16/08/2026 16:08", km: "470.078 km", valor: "R$ 236,26", litros: "36,46 L", local: "Ipiranga", media: "5.68 km/L" },
];

export function FuelHistoryTable() {
  return (
    <div className="mt-10 bg-alternative-bg border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent"><Fuel size={20} /></div>
          <h2 className="text-lg font-bold">Histórico de Abastecimentos</h2>
        </div>
        <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold">+ Novo Abastecimento</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background/50 text-[10px] uppercase tracking-widest text-muted">
            <tr>
              <th className="px-6 py-4">Data e KM</th>
              <th className="px-6 py-4">Abastecimento</th>
              <th className="px-6 py-4">Local</th>
              <th className="px-6 py-4">Média</th>
              <th className="px-6 py-4 text-center">Tanque Cheio</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {abastecimentos.map((item, i) => (
              <tr key={i} className="group hover:bg-background/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{item.data}</span>
                    <span className="text-xs text-muted">{item.km}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-success">{item.valor}</span>
                    <span className="text-[10px] text-muted">{item.litros} x R$ 6,47</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <MapPin size={14} /> {item.local}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold">
                    {item.media}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center"><CheckCircle2 size={18} className="text-success" /></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-muted hover:text-foreground"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}