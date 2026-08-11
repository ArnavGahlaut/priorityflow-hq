import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["AVAILABLE", "SERVING", "PAUSED", "OFFLINE"], default: "AVAILABLE" },
  servingToken: { type: Number, default: null },
  elapsedSeconds: { type: Number, default: 0 },
  queues: [{ type: String, enum: ["critical", "priority", "general", "documents", "support"] }],
  servedToday: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
