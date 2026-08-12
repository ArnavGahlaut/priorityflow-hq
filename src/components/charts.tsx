import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  COUNTER_UTILIZATION,
  PRIORITY_DISTRIBUTION,
  QUEUE_LENGTH_SERIES,
  SERVICE_DURATION,
  THROUGHPUT_SERIES,
  WAIT_SERIES,
} from "@/lib/demo-data";

const axis = {
  stroke: "var(--border-strong)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--popover-foreground)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11 },
} as const;

function Grid() {
  return <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />;
}

export function QueueLengthChart({ height = 220 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={QUEUE_LENGTH_SERIES} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {(["general", "priority", "critical"] as const).map((k, i) => (
            <linearGradient id={`grad-${k}`} key={k} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={`var(--chart-${i === 0 ? 1 : i === 1 ? 2 : 3})`}
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor={`var(--chart-${i === 0 ? 1 : i === 1 ? 2 : 3})`}
                stopOpacity={0}
              />
            </linearGradient>
          ))}
        </defs>
        <Grid />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} width={38} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey="general"
          stroke="var(--chart-1)"
          fill="url(#grad-general)"
          strokeWidth={1.8}
          animationDuration={1100}
        />
        <Area
          type="monotone"
          dataKey="priority"
          stroke="var(--chart-2)"
          fill="url(#grad-priority)"
          strokeWidth={1.8}
          animationDuration={1300}
        />
        <Area
          type="monotone"
          dataKey="critical"
          stroke="var(--chart-3)"
          fill="url(#grad-critical)"
          strokeWidth={1.8}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WaitChart({ height = 220 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={WAIT_SERIES} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <Grid />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} width={38} unit="m" />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey="sla"
          stroke="var(--chart-5)"
          strokeDasharray="4 4"
          strokeWidth={1.4}
          dot={false}
          animationDuration={900}
        />
        <Line
          type="monotone"
          dataKey="wait"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={{ r: 2.5, strokeWidth: 0, fill: "var(--chart-2)" }}
          animationDuration={1400}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ThroughputChart({ height = 220 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={THROUGHPUT_SERIES} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <Grid />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} width={38} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
        <Bar dataKey="served" fill="var(--chart-1)" radius={[2, 2, 0, 0]} animationDuration={1200} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PriorityDonut({
  height = 220,
  data,
}: {
  height?: number;
  data?: { name: string; value: number; color: string }[];
}) {
  const chartData = data && data.length ? data : PRIORITY_DISTRIBUTION;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="86%"
          paddingAngle={2}
          stroke="var(--surface)"
          strokeWidth={2}
          animationDuration={1200}
        >
          {chartData.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function UtilizationChart({
  height = 220,
  data,
}: {
  height?: number;
  data?: { name: string; util: number }[];
}) {
  const chartData = data && data.length ? data : COUNTER_UTILIZATION;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke="oklch(1 0 0 / 6%)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} {...axis} unit="%" />
        <YAxis type="category" dataKey="name" {...axis} width={78} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
        <Bar dataKey="util" fill="var(--chart-4)" radius={[0, 2, 2, 0]} animationDuration={1200} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServiceDurationChart({ height = 220 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={SERVICE_DURATION} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <Grid />
        <XAxis dataKey="name" {...axis} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} interval={0} />
        <YAxis {...axis} width={38} unit="m" />
        <Tooltip {...tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
        <Bar dataKey="minutes" fill="var(--chart-2)" radius={[2, 2, 0, 0]} animationDuration={1200} />
      </BarChart>
    </ResponsiveContainer>
  );
}
