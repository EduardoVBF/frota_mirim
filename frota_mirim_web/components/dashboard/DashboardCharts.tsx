"use client";
import {
    LineChart,
    Line,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

type Props = {
    title: string;
    data: { month: string; value: number }[] | undefined;
};

export default function DashboardChart({ title, data }: Props) {
    return (
        <div className="rounded-2xl border border-border bg-alternative-bg p-5">
            <h3 className="text-sm text-muted mb-4">{title}</h3>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="value"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}