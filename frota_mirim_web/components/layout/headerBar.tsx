"use client";
import { Search, Bell, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./themeToggle";
import Link from "next/link";

export default function HeaderBar({ isPublicPage }: { isPublicPage: boolean }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md transition-all duration-300
        ${isPublicPage ? "w-full" : "w-full lg:w-[calc(100%-16rem)]"}`}
    >
      <div
        className={`flex h-full items-center justify-between px-6 ${isPublicPage ? "max-w-7xl mx-auto" : ""}`}
      >
        {/* LADO ESQUERDO */}
        <div className="flex items-center gap-4">
          {isPublicPage ? (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-white text-xs font-bold -rotate-12">
                  FM
                </span>
              </div>
              <span className="font-bold tracking-tight text-lg">
                Frota Mirim
              </span>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-alternative-bg border border-border group focus-within:border-accent/50 transition-all">
              <Search
                size={16}
                className="text-muted group-focus-within:text-accent"
              />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-transparent text-sm outline-none w-48 placeholder:text-muted/50"
              />
            </div>
          )}
        </div>

        {/* LADO DIREITO */}
        <div className="flex items-center gap-3">
          {isPublicPage ? (
            <>
              {pathname === "/" && (
                <Link
                  href="/login"
                  className="rounded-full border border-accent/30 bg-accent/5 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all"
                >
                  Login
                </Link>
              )}
            </>
          ) : (
            // Interface do Usuário Logado
            <div className="flex items-center gap-4">
              <button className="p-2 text-muted hover:text-foreground relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
              </button>

              <div className="h-8 w-px bg-border/60 mx-1"></div>

              <button className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-alternative-bg transition-all border border-transparent hover:border-border">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold leading-none">
                    {session?.user?.firstName || "Usuário"}
                  </span>
                  <span className="text-[10px] text-success font-medium">
                    Online
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                  {session?.user?.firstName?.[0] && session?.user?.lastName?.[0]
                    ? `${session.user.firstName[0]}${session.user.lastName[0]}`
                    : ""}
                </div>
                <ChevronDown size={14} className="text-muted" />
              </button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
