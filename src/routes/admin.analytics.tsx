import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";
import {
  PriorityDonut,
  QueueLengthChart,
  ServiceDurationChart,
  ThroughputChart,
  UtilizationChart,
  WaitChart,
} from "@/components/charts";
import { useStore } from "@/lib/store";

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "var(--chart-3)",
  HIGH: "var(--chart-2)",
  NORMAL: "var(--chart-1)",
  LOW: "var(--chart-4)",
};

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PriorityQ" },
      {
        name: "description",
        content: "Queue length, wait times, throughput, priority mix and counter utilization.",
      },
      { property: "og:title", content: "Analytics — PriorityQ" },
      { property: "og:description", content: "Operational analytics across queues, waits and staff." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { requests, counters } = useStore();

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of requests) {
      counts[r.priority] = (counts[r.priority] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name] || "var(--chart-1)",
    }));
  }, [requests]);

  const utilizationData = useMemo(() => {
    return counters.map((c) => ({
      name: c.name,
      util: c.status === "SERVING" ? 100 : c.status === "PAUSED" ? 0 : 30,
    }));
  }, [counters]);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Demand, waiting and service performance over the day." />
      <div className="grid gap-3 p-4 sm:p-6 xl:grid-cols-2">
        <Panel title="Queue length over time">
          <QueueLengthChart />
        </Panel>
        <Panel title="Average wait by priority">
          <WaitChart />
        </Panel>
        <Panel title="Throughput per hour">
          <ThroughputChart />
        </Panel>
        <Panel title="Priority distribution (live)">
          <PriorityDonut data={priorityData} />
        </Panel>
        <Panel title="Counter utilization (live)">
          <UtilizationChart data={utilizationData} />
        </Panel>
        <Panel title="Service duration by queue">
          <ServiceDurationChart />
        </Panel>
      </div>
    </>
  );
}
