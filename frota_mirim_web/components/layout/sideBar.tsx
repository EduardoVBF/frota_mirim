"use client";
import {
  LayoutDashboard,
  Truck,
  Users,
  LogOut,
  Fuel,
  Phone,
  ClockCheck,
  Package,
  Forklift,
  ChevronDown,
  ArrowUpDown,
  Wrench,
  Bolt,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FadeIn } from "../motion/fadeIn";
import ImageZoom from "./ImageZoom";
import Link from "next/link";

type MenuItem = {
  name: string;
  path?: string;
  icon: React.ReactNode;
  children?: {
    name: string;
    path: string;
    icon: React.ReactNode;
  }[];
};

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Veículos",
    icon: <Truck size={20} />,
    children: [
      {
        name: "Veículos",
        path: "/veiculos",
        icon: <Truck size={20} />,
      },
      {
        name: "Entradas e Saídas",
        path: "/entradas&saidas",
        icon: <ClockCheck size={20} />,
      },
    ],
  },
  {
    name: "Abastecimentos",
    path: "/abastecimentos",
    icon: <Fuel size={20} />,
  },
  {
    name: "Manutenções",
    icon: <Wrench size={20} />,
    children: [
      {
        name: "Manutenções",
        path: "/manutencoes",
        icon: <Wrench size={20} />,
      },
      {
        name: "Peças e Serviços",
        path: "/itensManutencao",
        icon: <Bolt size={20} />,
      },
    ],
  },
  {
    name: "Estoque",
    icon: <Forklift size={20} />,
    children: [
      {
        name: "Itens em Estoque",
        path: "/estoque",
        icon: <Package size={20} />,
      },
      {
        name: "Movimentações",
        path: "/estoque/movimentacoes",
        icon: <ArrowUpDown size={20} />,
      },
    ],
  },
  {
    name: "Usuários",
    path: "/usuarios",
    icon: <Users size={20} />,
    children: [
      {
        name: "Telefones",
        path: "/telefones",
        icon: <Phone size={20} />,
      },
    ],
  },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<string[]>([]);

  function toggleSection(name: string) {
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  }

  // abrir automaticamente seção ativa
  useEffect(() => {
    const activeSections = menuItems
      .filter((item) =>
        item.children?.some((child) => pathname.startsWith(child.path)),
      )
      .map((item) => item.name);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenSections(activeSections);
  }, [pathname]);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center rotate-12 shadow-lg shadow-accent/20">
            <span className="text-white font-bold text-xs -rotate-12">FM</span>
          </div>

          <span className="text-lg font-bold tracking-tight">
            Frota<span className="text-accent">Mirim</span>
          </span>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const hasChildren = !!item.children;

            // ITEM SIMPLES
            if (!hasChildren) {
              const active = pathname.startsWith(item.path!);

              return (
                <FadeIn key={item.path}>
                  <Link
                    href={item.path!}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-alternative-bg hover:text-foreground"
                    }`}
                  >
                    {/* indicador lateral */}
                    {active && (
                      <div className="absolute left-0 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r bg-accent" />
                    )}

                    {item.icon}
                    {item.name}
                  </Link>
                </FadeIn>
              );
            }

            const open = openSections.includes(item.name);

            const activeParent = item.children?.some((child) =>
              pathname.startsWith(child.path),
            );

            return (
              <div key={item.name}>
                {/* botão pai */}
                <button
                  onClick={() => toggleSection(item.name)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                  ${
                    activeParent
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-alternative-bg hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </div>

                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* submenu */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    open ? "max-h-96 mt-1" : "max-h-0"
                  }`}
                >
                  {item.children && (
                    <div className="ml-4 border-l border-accent pl-2 space-y-1">
                      {item.children.map((child) => {
                        const active = pathname === child.path;

                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                          ${
                            active
                              ? "text-accent bg-accent/10"
                              : "text-muted hover:text-foreground hover:bg-alternative-bg"
                          }`}
                          >
                            {child.icon}
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* USER */}
        <div className="mt-auto border-t border-border pt-6">
          <div className="mb-3 flex items-center gap-3 px-2">
            {session?.user?.imageUrl ? (
              <ImageZoom
                src={session.user.imageUrl}
                alt={`${session.user.firstName} ${session.user.lastName}`}
                width={32}
                height={32}
                primaryImageClassName="w-8 h-8 rounded-full object-cover"
                zoom
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                {session?.user?.firstName?.[0]}
                {session?.user?.lastName?.[0]}
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                {session?.user?.firstName || "Usuário"}
              </span>

              {session?.user?.email && (
                <span className="text-xs text-muted">{session.user.email}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-muted hover:bg-error/10 hover:text-error transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
