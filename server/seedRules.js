import mongoose from "mongoose";
import dotenv from "dotenv";
import PriorityRule from "./models/PriorityRule.js";

dotenv.config();

async function seedRules() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected, seeding rules...");

  await PriorityRule.deleteMany({});

  await PriorityRule.insertMany([
    {
      condition: "Escalation keyword detected",
      detail: "unresponsive, severe bleeding, chest pain + collapse, staff escalation flag",
      priority: "CRITICAL",
      queueId: "critical",
      weight: 100,
      enabled: true,
      keywords: ["unresponsive", "severe bleeding", "chest pain", "collapse", "not breathing"],
    },
    {
      condition: "Urgency indicators detected",
      detail: "worsening, severe pain, shortness of breath, abnormal result follow-up",
      priority: "HIGH",
      queueId: "priority",
      weight: 70,
      enabled: true,
      keywords: ["worsening", "severe pain", "shortness of breath", "emergency", "urgent"],
    },
    {
      condition: "Routine request",
      detail: "No indicators matched; routed by selected service",
      priority: "NORMAL",
      queueId: "general",
      weight: 20,
      enabled: true,
      keywords: [],
    },
    {
      condition: "Document verification selected",
      detail: "Routes to verification counters with document capability",
      priority: "NORMAL",
      queueId: "documents",
      weight: 20,
      enabled: true,
      keywords: [],
    },
    {
      condition: "Informational request",
      detail: "opening hours, copy of records, contact detail change",
      priority: "LOW",
      queueId: "support",
      weight: 10,
      enabled: false,
      keywords: ["opening hours", "copy of records", "contact detail"],
    },
  ]);

  console.log("Rules seeded!");
  process.exit(0);
}

seedRules().catch((err) => {
  console.error(err);
  process.exit(1);
});
