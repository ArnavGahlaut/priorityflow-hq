import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Counter from "./models/Counter.js";

dotenv.config();

async function addCounters() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected, adding counters...");

  const staffPassword = await bcrypt.hash("staff1234", 10);

  const staff3 = await User.findOneAndUpdate(
    { email: "staff3@priorityflow.com" },
    { name: "L. Tanaka", email: "staff3@priorityflow.com", password: staffPassword, role: "OPERATOR" },
    { upsert: true, new: true },
  );
  const staff4 = await User.findOneAndUpdate(
    { email: "staff4@priorityflow.com" },
    { name: "P. Raghavan", email: "staff4@priorityflow.com", password: staffPassword, role: "OPERATOR" },
    { upsert: true, new: true },
  );

  await Counter.findOneAndUpdate(
    { name: "Counter 03" },
    {
      name: "Counter 03",
      staffId: staff3._id,
      queues: ["critical", "priority", "general", "documents", "support"],
    },
    { upsert: true, new: true },
  );

  await Counter.findOneAndUpdate(
    { name: "Counter 04" },
    {
      name: "Counter 04",
      staffId: staff4._id,
      queues: ["critical", "priority", "general", "documents", "support"],
    },
    { upsert: true, new: true },
  );

  console.log("Counter 03 and Counter 04 added — handle ALL queues (critical to normal)");
  process.exit(0);
}

addCounters().catch((err) => {
  console.error(err);
  process.exit(1);
});
