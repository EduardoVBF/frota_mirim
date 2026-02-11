"use client";
import PrimaryInput from "@/components/form/primaryInput";
import ColoredTextBox from "@/components/coloredTextBox";
import toast, { Toaster } from "react-hot-toast";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Email ou senha inválidos");
      setError("Email ou senha inválidos");
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");

    window.location.href = "/dashboard";
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-[75dvh] bg-background flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-5xl flex flex-col items-center justify-center gap-6">
          {/* Botão de Voltar Discreto */}
          <Link
            href="/"
            className="self-baseline text-sm text-foreground hover:text-accent transition-colors flex items-center gap-2"
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <PrimaryInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />

              <PrimaryInput
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {error && <ColoredTextBox type="error">{error}</ColoredTextBox>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-accent text-background font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {loading ? "Entrando..." : "Entrar"}
                </div>
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
      </div>
    </>
  );
}
