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
  InsightItem,
} from "@/services/dashboard.service";
import DashboardChart from "@/components/dashboard/DashboardCharts";
import { useDashboardCharts } from "@/services/dashboard.hooks";
import { FadeIn } from "@/components/motion/fadeIn";
import { useState } from "react";
import dayjs from "dayjs";

export default function DashboardPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    preset: "THIS_MONTH",
  });

  const chartsQuery = useDashboardCharts(filters);
  const { data: charts, isLoading: loadingCharts } = chartsQuery;

  const overviewQuery = useDashboardOverview(filters);
  const financialQuery = useDashboardFinancial(filters);
  const insightsQuery = useDashboardInsights(filters);
  const alertsQuery = useDashboardAlerts();

  const { data: overview, isLoading: loadingOverview, isFetching: fetchingOverview } = overviewQuery;
  const { data: financial, isLoading: loadingFinancial, isFetching: fetchingFinancial } = financialQuery;
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
              ${active
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "text-muted border-border hover:bg-muted/40"}
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
                value={fetchingOverview ? "..." : overview?.vehiclesInMaintenance}
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
                title="Combustível no mês"
                value={fetchingFinancial ? "..." : formatMoney(financial?.fuelCostMonth)}
              />

              <FinanceCard
                icon={Wrench}
                title="Manutenção no mês"
                value={fetchingFinancial ? "..." : formatMoney(financial?.maintenanceCostMonth)}
              />

              <FinanceCard
                icon={DollarSign}
                title="Custo por km"
                value={fetchingFinancial ? "..." : `R$ ${financial?.costPerKm?.toFixed(2)}`}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardChart
              title="Gasto com combustível"
              data={charts?.fuelMonthly}
            />

            <DashboardChart
              title="Gasto com manutenção"
              data={charts?.maintenanceMonthly}
            />
          </div>
        )}

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <InsightCard
            title="Veículos com maior custo"
            loading={loadingInsights}
            data={insights?.topMaintenanceCost}
            type="money"
          />

          <InsightCard
            title="Pior consumo"
            loading={loadingInsights}
            data={insights?.worstFuelEfficiency}
            type="fuel"
          />

        </div>

        {/* ALERTAS */}
        <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden">
          <div className="p-4 border-b border-border font-semibold text-muted">
            <AlertTriangle size={20} className="inline-block mr-2 text-warning" />
            Alertas recentes
          </div>

          <div className="divide-y divide-border">
            {loadingAlerts
              ? Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
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

/* COMPONENTS */
function DashboardCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div className="
      rounded-2xl border border-border 
      bg-linear-to-br from-alternative-bg to-background
      p-3 flex gap-4 items-center
      hover:shadow-md hover:scale-[1.01]
      transition-all duration-200
    ">
      <div className="
        p-3 rounded-xl 
        bg-accent/10 text-accent
        shadow-inner
      ">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-[11px] text-muted uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold mt-1">
          {value ?? "-"}
        </p>
      </div>

    </div>
  );
}

function FinanceCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number | undefined;
}) {
  return (
    <div className="
      rounded-2xl border border-border 
      bg-linear-to-br from-alternative-bg to-background
      p-4
      hover:shadow-md transition
    ">
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <div className="p-2 bg-accent/10 rounded-lg text-accent">
          <Icon size={16} />
        </div>
        {title}
      </div>

      <p className="text-3xl font-semibold tracking-tight">
        {value ?? "-"}
      </p>
    </div>
  );
}

function InsightCard({
  title,
  data,
  type,
  loading,
}: {
  title: string;
  data: InsightItem[] | undefined;
  type: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-alternative-bg overflow-hidden">
      <div className="p-4 border-b border-border font-semibold text-muted flex items-center justify-between">
        {title}
      </div>

      <div className="divide-y divide-border text-sm">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))
          : data?.map((item: InsightItem, i: number) => (
            <div
              key={item.vehicle}
              className="flex justify-between px-4 py-3 hover:bg-muted/30 transition"
            >
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted">#{i + 1}</span>
                {item.vehicle}
              </span>

              <span className="font-semibold text-accent">
                {type === "money"
                  ? formatMoney(item.value)
                  : `${item.kmPerLiter?.toFixed(1)} km/l`}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function AlertRow({
  message,
  severity,
  sequenceId,
}: {
  message: string;
  severity: string;
  sequenceId: number;
}) {
  const color =
    severity === "CRÍTICO"
      ? "text-red-500"
      : severity === "AVISO"
        ? "text-yellow-500"
        : "text-muted";

  return (
    <div className="flex justify-between px-4 py-3 text-sm hover:bg-muted/30 transition">
      <div className="space-x-2">
        <span>#{sequenceId}</span>
        <span>{message}</span>
      </div>
      <span className={`text-xs font-semibold ${color}`}>
        {severity}
      </span>
    </div>
  );
}

/* SKELETON */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-alternative-bg p-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-background rounded" />
        <div className="h-5 w-16 bg-background rounded" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="h-3 w-full bg-background rounded" />
    </div>
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