"use client";
import AlertsDropdown from "@/components/alerts/alertsDropdown";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./themeToggle";
import ImageZoom from "./ImageZoom";
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
          {isPublicPage && (
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
              <AlertsDropdown />
              <div className="h-8 w-px bg-border/60 mx-1"></div>

              <button className="flex items-center gap-2 p-1 px-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold leading-none">
                    {session?.user?.firstName || "Usuário"}
                  </span>
                  <span className="text-[10px] text-success font-medium">
                    Online
                  </span>
                </div>
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
                    {session?.user?.firstName?.[0] &&
                      session?.user?.lastName?.[0]
                      ? `${session.user.firstName[0]}${session.user.lastName[0]}`
                      : ""}
                  </div>
                )}
              </button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
