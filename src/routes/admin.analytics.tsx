import { createFileRoute } from "@tanstack/react-router";

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
        <Panel title="Priority distribution">
          <PriorityDonut />
        </Panel>
        <Panel title="Counter utilization">
          <UtilizationChart />
        </Panel>
        <Panel title="Service duration by queue">
          <ServiceDurationChart />
        </Panel>
      </div>
    </>
  );
}
