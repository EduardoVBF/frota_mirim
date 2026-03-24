import { FadeIn } from "@/components/motion/fadeIn";
import { Car, Fuel, Wrench, Users, BarChart3, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frota Mirim - Gestão de frota inteligente",
  description:
    "Sustentabilidade e inteligência de dados para otimizar sua operação logística de ponta a ponta.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30">
      <main className="pt-32 pb-20 px-6">
        {/* HERO */}
        <FadeIn>
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-8">
              🚀 Plataforma em evolução contínua
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 bg-linear-to-r from-accent to-foreground/70 bg-clip-text text-transparent">
              Gestão de frota inteligente
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-10">
              Controle completo de veículos, manutenção e custos com base em
              dados reais. Tome decisões melhores e reduza desperdícios.
            </p>
          </div>
        </FadeIn>

        {/* PROBLEMA / VALOR */}
        <FadeIn>
          <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-3 gap-6 text-center">
            <ValueCard
              icon={<BarChart3 size={20} />}
              title="Decisões baseadas em dados"
              description="Indicadores claros em tempo real e por períodos."
            />
            <ValueCard
              icon={<ShieldCheck size={20} />}
              title="Controle total da operação"
              description="Saiba exatamente o que está acontecendo com cada veículo."
            />
            <ValueCard
              icon={<Car size={20} />}
              title="Redução de custos"
              description="Identifique desperdícios e otimize consumo e manutenção."
            />
          </div>
        </FadeIn>

        {/* FEATURES */}
        <div
          id="functionalities"
          className="max-w-6xl mx-auto mt-28 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FeatureCard
            icon={<Car size={18} />}
            title="Controle de Veículos"
            description="Monitore status, quilometragem e histórico completo da frota."
          />
          <FeatureCard
            icon={<Fuel size={18} />}
            title="Abastecimentos Inteligentes"
            description="Acompanhe consumo, médias e detecte anomalias automaticamente."
          />
          <FeatureCard
            icon={<Wrench size={18} />}
            title="Gestão de Manutenção"
            description="Evite problemas com alertas e controle total das manutenções."
          />
          <FeatureCard
            icon={<Users size={18} />}
            title="Gestão de Motoristas"
            description="Controle CNH, vencimentos e desempenho da equipe."
          />
        </div>

        {/* MÉTRICAS / PROVA */}
        <FadeIn>
          <div className="max-w-5xl mx-auto mt-28 grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            <Metric number="100%" label="Visibilidade da frota" />
            <Metric number="Real-time" label="Monitoramento" />
            <Metric number="Automático" label="Alertas inteligentes" />
          </div>
        </FadeIn>

        {/* CTA FINAL */}
        <FadeIn>
          <div className="max-w-4xl mx-auto mt-32 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              Pronto para profissionalizar sua frota?
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-base font-medium mb-8">
              Tenha controle total da sua operação em poucos minutos.
            </div>
          </div>
        </FadeIn>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border mt-20 py-10 px-6 text-center text-sm text-muted">
        <p className="mb-2">
          © 2026 Frota Mirim — Sistema de Gestão Inteligente
        </p>
        <p className="opacity-70">
          Desenvolvido para controle, eficiência e tomada de decisão baseada em
          dados.
        </p>
      </footer>
    </div>
  );
}

/* COMPONENTES */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <FadeIn>
      <div className="group p-6 rounded-2xl bg-alternative-bg border border-border hover:border-accent/50 transition-all duration-300">
        <div className="flex items-center gap-2 mb-3 text-accent">
          {icon}
          <div className="w-6 h-0.5 bg-accent opacity-50 group-hover:w-10 transition-all" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
      </div>
    </FadeIn>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-alternative-bg">
      <div className="mb-3 text-accent flex justify-center">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

function Metric({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-accent">{number}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
