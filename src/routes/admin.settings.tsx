import { createFileRoute } from "@tanstack/react-router";

import { Disclaimer, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/metric-card";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "System settings — PriorityQ" },
      { name: "description", content: "Escalation windows, notification behaviour and fairness safeguards." },
      { property: "og:title", content: "System settings — PriorityQ" },
      { property: "og:description", content: "Configure escalation, notifications and fairness safeguards." },
    ],
  }),
  component: Settings,
});

const GROUPS = [
  {
    title: "Fairness safeguards",
    rows: [
      ["Anti-starvation escalation", "Normal requests escalate one level after 25 minutes waiting"],
      ["Maximum wait guard", "Any request waiting over 45 minutes is surfaced to the triage lead"],
      ["Priority cap per hour", "No more than 40% of served requests may be elevated priority"],
    ],
  },
  {
    title: "Notifications",
    rows: [
      ["Position updates", "Pushed whenever the user's position changes"],
      ["Called alert", "Sent immediately with counter number and a 5 minute grace window"],
      ["ETA revision", "Sent only when the estimate moves by more than 4 minutes"],
    ],
  },
  {
    title: "Priority engine",
    rows: [
      ["Suggestion mode", "Rules suggest a priority; staff confirmation is always required"],
      ["Explainability", "Every suggestion records the rule and signals that triggered it"],
      ["Audit retention", "Priority changes and transfers retained for 180 days"],
    ],
  },
];

function Settings() {
  return (
    <>
      <PageHeader title="System settings" subtitle="How PriorityQ balances urgency against fairness." />
      <div className="space-y-4 p-4 sm:p-6">
        <Disclaimer />
        {GROUPS.map((g) => (
          <Panel key={g.title} title={g.title} dense>
            <ul>
              {g.rows.map(([label, detail]) => (
                <li
                  key={label}
                  className="grid gap-1 border-b border-border/50 px-4 py-3 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4"
                >
                  <span className="text-[13px] font-medium">{label}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
