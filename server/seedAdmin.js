import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected, creating admin...");

  const hashed = await bcrypt.hash("admin1234", 10);

  const admin = await User.findOneAndUpdate(
    { email: "admin@priorityflow.com" },
    {
      name: "Dana Ortiz",
      email: "admin@priorityflow.com",
      password: hashed,
      role: "ADMIN",
    },
    { upsert: true, new: true },
  );

  console.log("Admin ready:", admin.email, admin.role);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
