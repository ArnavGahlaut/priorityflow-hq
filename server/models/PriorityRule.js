import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  detail: { type: String, required: true },
  priority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL", "LOW"], required: true },
  queueId: {
    type: String,
    enum: ["critical", "priority", "general", "documents", "support"],
    required: true,
  },
  enabled: { type: Boolean, default: true },
  weight: { type: Number, default: 20 },
  keywords: [{ type: String }],
});

export default mongoose.model("PriorityRule", ruleSchema);
