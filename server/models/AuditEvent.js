import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  actor: { type: String, required: true },
  action: { type: String, required: true },
  requestId: { type: String, required: true },
  from: { type: String, default: "" },
  to: { type: String, default: "" },
  time: { type: Date, default: Date.now },
});

export default mongoose.model("AuditEvent", auditSchema);
