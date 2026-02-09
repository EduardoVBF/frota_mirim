"use client";
import { LayoutDashboard, Truck, Users, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  { name: "Veículos", path: "/veiculos", icon: <Truck size={20} /> },
  { name: "Motoristas", path: "/motoristas", icon: <Users size={20} /> },
  { name: "Configurações", path: "/settings", icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background transition-transform">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded bg-accent flex items-center justify-center rotate-12 shadow-lg shadow-accent/20">
            <span className="text-white font-bold text-xs -rotate-12">FM</span>
          </div>
          <span className="text-lg font-bold tracking-tighter text-foreground">
            Frota<span className="text-accent">Mirim</span>
          </span>
        </div>

        {/* Menu Principal */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-muted hover:bg-alternative-bg hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${active ? "text-accent" : "text-muted group-hover:text-foreground"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {active && <div className="h-1 w-1 rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer da Sidebar / User Profile */}
        <div className="mt-auto border-t border-border pt-6">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-alternative-bg border border-border flex items-center justify-center overflow-hidden font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-none">
                Admin
              </span>
              <span className="text-xs text-muted">admin@frotamirim.com</span>
            </div>
          </div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-muted hover:bg-error/10 hover:text-error transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
