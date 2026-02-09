import Link from "next/link";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Frota Mirim",
  description: "Acesse sua conta para gerenciar sua frota",
};

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 antialiased">
      {/* Botão de Voltar Discreto */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-sm text-muted hover:text-foreground transition-colors flex items-center gap-2"
      >
        ← Voltar para a home
      </Link>

      <div className="w-full max-w-100 space-y-8">
        {/* Logo e Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 bg-accent rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white font-bold -rotate-12">FM</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground pt-4">
            Acesse sua conta
          </h1>
          <p className="text-sm text-muted">
            Insira suas credenciais para gerenciar sua frota
          </p>
        </div>

        {/* Formulário */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-muted ml-1"
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="nome@empresa.com"
              className="w-full h-12 px-4 rounded-xl bg-alternative-bg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label
                className="text-sm font-medium text-muted"
                htmlFor="password"
              >
                Senha
              </label>
              {/* <Link href="#" className="text-xs text-accent hover:underline">
                Esqueceu a senha?
              </Link> */}
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-alternative-bg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-accent text-background font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 cursor-pointer"
          >
            Entrar no Dashboard
          </button>
        </form>

        {/* Footer do Login */}
        <p className="text-center text-sm text-muted">
          Não tem acesso?{" "}
          <span className="text-foreground font-medium">
            Solicite ao seu gestor
          </span>
        </p>
      </div>

      {/* Marca d'água ou detalhe sutil */}
      <footer className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] text-muted/40">
        Frota Mirim &copy; 2026 — Secure Access
      </footer>
    </div>
  );
}
