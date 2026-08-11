import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Queue from "./models/Queue.js";
import Counter from "./models/Counter.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected, seeding...");

  // Clear old data
  await Queue.deleteMany({});
  await Counter.deleteMany({});

  // Create queues
  const queues = await Queue.insertMany([
    { id: "critical", name: "Critical Queue", code: "CRIT", slaMinutes: 2 },
    { id: "priority", name: "Priority Queue", code: "PRI", slaMinutes: 6 },
    { id: "general", name: "General Queue", code: "GEN", slaMinutes: 18 },
    { id: "documents", name: "Document Verification", code: "DOC", slaMinutes: 10 },
    { id: "support", name: "Support Desk", code: "SUP", slaMinutes: 8 },
  ]);
  console.log(`${queues.length} queues created`);

  // Create staff users (needed for counters)
  const staffPassword = await bcrypt.hash("staff1234", 10);
  const staff1 = await User.create({
    name: "A. Meyer",
    email: "staff1@priorityflow.com",
    password: staffPassword,
    role: "OPERATOR",
  });
  const staff2 = await User.create({
    name: "R. Okafor",
    email: "staff2@priorityflow.com",
    password: staffPassword,
    role: "OPERATOR",
  });

  // Create counters
  const counters = await Counter.insertMany([
    { name: "Counter 01", staffId: staff1._id, queues: ["critical", "priority", "general"] },
    { name: "Counter 02", staffId: staff2._id, queues: ["general", "documents", "support"] },
  ]);
  console.log(`${counters.length} counters created`);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
