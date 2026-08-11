import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  token: { type: Number, required: true },
  priority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL", "LOW"], required: true },
  suggestedPriority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL", "LOW"], required: true },
  queueId: {
    type: String,
    enum: ["critical", "priority", "general", "documents", "support"],
    required: true,
  },
  service: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["WAITING", "CALLED", "SERVING", "COMPLETED", "LEFT"],
    default: "WAITING",
  },
  waitedMinutes: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  counterId: { type: mongoose.Schema.Types.ObjectId, ref: "Counter", default: null },
  reason: { type: String, default: "" },
  reviewed: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channel: { type: String, enum: ["Web", "Mobile", "Kiosk", "Front desk"], default: "Web" },
});

export default mongoose.model("Request", requestSchema);
