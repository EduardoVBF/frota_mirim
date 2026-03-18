"use client";
import {
  Car,
  Wrench,
  Fuel,
  AlertTriangle,
  DollarSign,
  LayoutDashboard,
  Gauge,
  Filter,
  FilterX,
} from "lucide-react";
import {
  useDashboardOverview,
  useDashboardFinancial,
  useDashboardInsights,
  useDashboardAlerts,
} from "@/services/dashboard.hooks";
import type {
  DashboardFilters,
  DashboardPreset,
} from "@/services/dashboard.service";
import { SkeletonCard, SkeletonRow } from "@/components/dashboard/Skeleton";
import InsightCardCost from "@/components/dashboard/InsightCardCost";
import InsightCardFuel from "@/components/dashboard/InsightCardFuel";
import DashboardChart from "@/components/dashboard/DashboardCharts";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useDashboardCharts } from "@/services/dashboard.hooks";
import FinanceCard from "@/components/dashboard/FinanceCard";
import AlertRow from "@/components/dashboard/AlertRow";
import { FadeIn } from "@/components/motion/fadeIn";
import { useState } from "react";
import dayjs from "dayjs";

export default function DashboardPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    preset: "THIS_MONTH",
  });

  const chartsQuery = useDashboardCharts(filters);
  const { data: charts, isLoading: loadingCharts } = chartsQuery;

  const overviewQuery = useDashboardOverview(filters);
  const financialQuery = useDashboardFinancial(filters);
  const insightsQuery = useDashboardInsights(filters);
  const alertsQuery = useDashboardAlerts();

  const {
    data: overview,
    isLoading: loadingOverview,
    isFetching: fetchingOverview,
  } = overviewQuery;
  const {
    data: financial,
    isLoading: loadingFinancial,
    isFetching: fetchingFinancial,
  } = financialQuery;
  const { data: insights, isLoading: loadingInsights } = insightsQuery;
  const { data: alerts, isLoading: loadingAlerts } = alertsQuery;

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ preset: "THIS_MONTH" });
  };

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <LayoutDashboard size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard da Frota</h1>
              <p className="text-muted text-sm">
                Indicadores estratégicos da operação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg"
            >
              {showFilters ? <FilterX size={16} /> : <Filter size={16} />}
              Filtros
            </button>
          </div>
        </header>

        {/* FILTROS */}
        {showFilters && (
          <div className="rounded-2xl border border-border bg-alternative-bg p-5 space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
                Filtros
              </h2>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs px-3 py-1 rounded-lg border border-border hover:bg-muted/40 transition"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* PRESETS */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Hoje", value: "TODAY" },
                { label: "7 dias", value: "LAST_7_DAYS" },
                { label: "30 dias", value: "LAST_30_DAYS" },
                { label: "Mês atual", value: "THIS_MONTH" },
                { label: "Último mês", value: "LAST_MONTH" },
              ].map((p) => {
                const active = filters.preset === p.value;

                return (
                  <button
                    key={p.value}
                    onClick={() =>
                      setFilters({ preset: p.value as DashboardPreset })
                    }
                    className={`
              px-3 py-1.5 rounded-full text-sm border transition
              ${
                active
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "text-muted border-border hover:bg-muted/40"
              }
            `}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* CUSTOM RANGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Data inicial</label>
                <input
                  type="date"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      preset: "CUSTOM",
                      startDate: dayjs(e.target.value).toISOString(),
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Data final</label>
                <input
                  type="date"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      preset: "CUSTOM",
                      endDate: dayjs(e.target.value).toISOString(),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {loadingOverview ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <DashboardCard
                icon={Car}
                label="Veículos ativos"
                value={fetchingOverview ? "..." : overview?.activeVehicles}
              />

              <DashboardCard
                icon={Wrench}
                label="Em manutenção"
                value={
                  fetchingOverview ? "..." : overview?.vehiclesInMaintenance
                }
              />

              <DashboardCard
                icon={Fuel}
                label="Consumo médio"
                value={
                  fetchingOverview
                    ? "..."
                    : `${overview?.avgFuelConsumption?.toFixed(1)} km/l`
                }
              />

              <DashboardCard
                icon={AlertTriangle}
                label="Alertas ativos"
                value={fetchingOverview ? "..." : overview?.alertsActive}
              />

              <DashboardCard
                icon={Gauge}
                label="Disponibilidade"
                value={
                  fetchingOverview
                    ? "..."
                    : `${overview?.availability ? (overview?.availability * 100).toFixed(0) : 0}%`
                }
              />
            </>
          )}
        </div>

        {/* FINANCEIRO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loadingFinancial ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <FinanceCard
                icon={Fuel}
                title="Combustível no período"
                value={
                  fetchingFinancial
                    ? "..."
                    : formatMoney(financial?.fuelCostMonth)
                }
              />

              <FinanceCard
                icon={Wrench}
                title="Manutenção no período"
                value={
                  fetchingFinancial
                    ? "..."
                    : formatMoney(financial?.maintenanceCostMonth)
                }
              />

              <FinanceCard
                icon={DollarSign}
                title="Custo por km"
                value={
                  fetchingFinancial
                    ? "..."
                    : `R$ ${financial?.costPerKm?.toFixed(2)}`
                }
              />
            </>
          )}
        </div>

        {/* GRÁFICOS */}
        {loadingCharts ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <DashboardChart
              title="Gasto com combustível"
              data={charts?.fuel}
              type="currency"
              granularity={charts?.granularity}
            />

            <DashboardChart
              title="Gasto com manutenção"
              data={charts?.maintenance}
              type="currency"
              granularity={charts?.granularity}
            />
          </div>
        )}

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightCardCost
            title="Veículos com maior custo"
            loading={loadingInsights}
            data={insights?.topMaintenanceCost}
          />

          <InsightCardFuel
            title="Consumo"
            loading={loadingInsights}
            fuelEfficiency={insights?.fuelEfficiency}
          />
        </div>

        {/* ALERTAS */}
        <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden">
          <div className="p-4 border-b border-border font-semibold text-muted">
            <AlertTriangle
              size={20}
              className="inline-block mr-2 text-warning"
            />
            Alertas recentes
          </div>

          <div className="divide-y divide-border">
            {loadingAlerts
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : alerts?.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    message={alert.message}
                    severity={mapSeverity(alert.severity)}
                    sequenceId={alert.sequenceId}
                  />
                ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

/* HELPERS */
function formatMoney(value?: number) {
  if (!value) return "-";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function mapSeverity(severity: string) {
  if (severity === "CRITICAL") return "CRÍTICO";
  if (severity === "WARNING") return "AVISO";
  return "ALERTA";
}
