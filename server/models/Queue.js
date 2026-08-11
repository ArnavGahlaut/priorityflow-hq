import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
  id: { type: String, enum: ["critical", "priority", "general", "documents", "support"], unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  paused: { type: Boolean, default: false },
  slaMinutes: { type: Number, required: true },
});

export default mongoose.model("Queue", queueSchema);
