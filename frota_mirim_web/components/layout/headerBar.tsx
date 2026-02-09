"use client";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./themeToggle";
import Link from "next/link";

export default function HeaderBar() {
  const pathname = usePathname();
  console.log("Current Path:", pathname); // Log do caminho atual para depuração
  return (
    <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white text-xs font-bold -rotate-12">FM</span>
          </div>
          <span className="font-bold tracking-tight text-lg">Frota Mirim</span>
        </Link>

        <div className="flex items-center gap-3">
          {pathname == "/" && (
            <Link
              href="/login"
              className="group relative flex items-center overflow-hidden rounded-full border border-accent/30 bg-accent/5 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
            >
              <span className="relative z-10 transition-transform duration-300">
                Login
              </span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
