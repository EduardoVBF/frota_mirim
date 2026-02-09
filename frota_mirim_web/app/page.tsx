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
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Nova atualização: Projeto iniciado!
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 bg-linear-to-r from-accent to-foreground/70 bg-clip-text text-transparent">
            Frota Mirim
          </h1>

          <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-12">
            Sustentabilidade e inteligência de dados para otimizar sua operação
            logística de ponta a ponta.
          </p>
        </div>

        {/* Feature Grid - Cards Profissionais */}
        <div id="functionalities" className="max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Controle de Veículos"
            description="Cadastre sua frota e monitore status e desempenho de cada veículo em tempo real."
            statusColor="bg-success"
          />
          <Card
            title="Controle de Abastecimentos"
            description="Registre e analise os abastecimentos, otimizando custos e identificando padrões de consumo."
            statusColor="bg-error"
          />
          <Card
            title="Gestão de Manutenção"
            description="Tenha controle total sobre as manutenções, com alertas automáticos e histórico detalhado de cada veículo."
            statusColor="bg-warning"
          />
          <Card
            title="Gestão de Motoristas"
            description="Gestão completa de documentação, multas e conduta dos motoristas."
            statusColor="bg-accent"
          />
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-10 px-6 text-center text-sm text-muted">
        &copy; 2026 Frota Mirim — Sistema de Gestão Inteligente.
      </footer>
    </div>
  );
}

function Card({
  title,
  description,
  statusColor,
}: {
  title: string;
  description: string;
  statusColor: string;
}) {
  return (
    <div className="group p-8 rounded-2xl bg-alternative-bg border border-border hover:border-accent/50 transition-all duration-300">
      <div
        className={`w-10 h-1 mb-6 ${statusColor} rounded-full opacity-60 group-hover:w-16 transition-all`}
      />
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-muted leading-relaxed text-sm">{description}</p>
    </div>
  );
}
