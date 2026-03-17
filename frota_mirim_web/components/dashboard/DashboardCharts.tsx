"use client";
import {
    BarChart,
    LineChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

type Props = {
    title: string;
    data: { label: string; value: number }[] | undefined;
    type?: "currency" | "number";
    granularity?: "hour" | "day" | "month";
};

type TooltipProps = {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
    type?: "currency" | "number";
};

function CustomTooltip({
    active,
    payload,
    label,
    type,
    granularity,
}: TooltipProps & { granularity?: string }) {
    if (!active || !payload || payload.length === 0) return null;

    const value = payload[0].value;

    const formattedValue =
        type === "currency"
            ? value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            })
            : value.toLocaleString("pt-BR");

    return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-xs">
            <p className="text-gray-500 mb-1">
                {granularity === "hour"
                    ? `Hora: ${label}`
                    : granularity === "day"
                        ? `Dia: ${label}`
                        : `Período: ${label}`}
            </p>

            <p className="text-base font-semibold text-gray-900">
                {formattedValue}
            </p>
        </div>
    );
}

function formatValue(value: number, type?: "currency" | "number") {
    if (type === "currency") {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    return value.toLocaleString("pt-BR");
}

function getChartType(granularity?: string) {
    if (granularity === "hour") return "line";
    return "bar";
}

export default function DashboardChart({
    title,
    data,
    type,
    granularity,
}: Props) {
    const hasData = data && data.length > 0;
    const chartType = getChartType(granularity);

    return (
        <div className="rounded-2xl border border-border bg-alternative-bg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-muted">
                    {title}{" "}
                    {granularity && (
                        <span className="text-xs opacity-60">
                            ({granularity === "hour"
                                ? "por hora"
                                : granularity === "day"
                                    ? "por dia"
                                    : "por mês"})
                        </span>
                    )}
                </h3>
            </div>

            <div className="h-64">
                {!hasData ? (
                    <div className="h-full flex items-center justify-center text-muted text-sm">
                        Sem dados disponíveis
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "line" ? (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="label" fontSize={12} />
                                <YAxis
                                    fontSize={12}
                                    tickFormatter={(v) => formatValue(v, type)}
                                />
                                <Tooltip
                                    content={
                                        <CustomTooltip type={type} granularity={granularity} />
                                    }
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#4F46E5"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={data} barGap={1} >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="label" fontSize={12} />
                                <YAxis
                                    fontSize={12}
                                    tickFormatter={(v) => formatValue(v, type)}
                                />
                                <Tooltip
                                    content={
                                        <CustomTooltip type={type} granularity={granularity} />
                                    }
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#4F46E5"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}