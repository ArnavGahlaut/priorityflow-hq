import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["USER", "OPERATOR", "TRIAGE_LEAD", "ADMIN"],
    default: "USER",
  },
  tier: { type: String, enum: ["Standard", "Priority"], default: "Standard" },
  requests: { type: Number, default: 0 },
  status: { type: String, enum: ["Active", "Invited", "Suspended"], default: "Active" },
  lastVisit: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
