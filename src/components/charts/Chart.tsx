/* Copyright 2026 SkyNet. Charts component using Recharts. */

import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter,
} from "recharts";
import { BarChart3, TrendingUp, PieChartIcon, Activity, CircleDot } from "lucide-react";
import { cn } from "@/lib/cn";

export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

export interface ChartProps {
  data: Record<string, unknown>[];
  xKey?: string;
  yKeys?: string[];
  type?: ChartType;
  title?: string;
  height?: number;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1, 220 70% 50%))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
];

const FALLBACK_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

const CHART_TYPE_CONFIG: Record<ChartType, { icon: React.ReactNode; label: string }> = {
  bar: { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Bar" },
  line: { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Line" },
  area: { icon: <Activity className="h-3.5 w-3.5" />, label: "Area" },
  pie: { icon: <PieChartIcon className="h-3.5 w-3.5" />, label: "Pie" },
  scatter: { icon: <CircleDot className="h-3.5 w-3.5" />, label: "Scatter" },
};

export function Chart({
  data,
  xKey,
  yKeys,
  type = "bar",
  title,
  height = 300,
  colors = FALLBACK_COLORS,
  className,
}: ChartProps) {
  const [chartType, setChartType] = useState<ChartType>(type);

  const keys = useMemo(() => {
    if (!data.length) return { x: "", y: [] };
    const allKeys = Object.keys(data[0]);
    const x = xKey || allKeys[0];
    const y = yKeys || allKeys.filter((k) => k !== x && typeof data[0][k] === "number");
    return { x, y };
  }, [data, xKey, yKeys]);

  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center h-48 border rounded-lg bg-muted/20", className)}>
        <span className="text-sm text-muted-foreground">No data available</span>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={keys.x} className="text-xs" tick={{ fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.y.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={keys.x} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.y.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={keys.x} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.y.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.15} />
            ))}
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data.slice(0, 10).map((d) => ({ name: String(d[keys.x]), value: Number(d[keys.y[0]] || 0) }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.slice(0, 10).map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          </PieChart>
        );
      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={keys.x} tick={{ fontSize: 11 }} name={keys.x} />
            <YAxis dataKey={keys.y[0]} tick={{ fontSize: 11 }} name={keys.y[0]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Scatter data={data} fill={colors[0]} />
          </ScatterChart>
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with type selector */}
      <div className="flex items-center justify-between">
        {title && <span className="text-sm font-medium">{title}</span>}
        <div className="flex gap-1">
          {(Object.entries(CHART_TYPE_CONFIG) as [ChartType, typeof CHART_TYPE_CONFIG[ChartType]][]).map(([t, config]) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                chartType === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {config.icon}
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="border rounded-lg p-2 bg-background">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Chart;
