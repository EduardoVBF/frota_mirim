"use client";
import Sidebar from "@/components/layout/sideBar";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import HeaderBar from "./headerBar";

const publicPaths = ["/", "/login"];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = publicPaths.includes(pathname);

  // Classe utilitária para empurrar o conteúdo quando houver sidebar
  const layoutOffset = !isPublicPage ? "lg:pl-64" : "";

  return (
    <div className="min-h-screen bg-background">
      <SessionProvider>
        {!isPublicPage && <Sidebar />}

        <HeaderBar isPublicPage={isPublicPage} />

        <main className={`${layoutOffset} pt-16 transition-all duration-300`}>
          <div className="p-3">{children}</div>
        </main>
      </SessionProvider>
    </div>
  );
}
