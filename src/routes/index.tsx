
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { PriorityEngine } from "@/components/landing/priority-engine";
import { LiveOperations } from "@/components/landing/live-operations";
import { Realtime } from "@/components/landing/realtime";
import { Analytics } from "@/components/landing/analytics";
import { FinalCta, SiteFooter, SiteNav } from "@/components/landing/final-cta";

const title = "PriorityQ — Priority-aware queue management";
const description =
  "Priority-aware queue management that routes urgent requests, coordinates staff, and keeps everyone updated in real time.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <SiteNav />
      <Hero />
      <Problem />
      <div id="operations">
        <PriorityEngine />
        <LiveOperations />
      </div>
      <Realtime />
      <Analytics />
      <FinalCta />
      <SiteFooter />
    </motion.main>
  );
}