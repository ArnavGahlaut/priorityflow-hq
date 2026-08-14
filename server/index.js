import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import queueRoutes from "./routes/queue.js";
import otpRoutes from "./routes/otp.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`),
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));