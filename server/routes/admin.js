import express from "express";
import User from "../models/User.js";
import PriorityRule from "../models/PriorityRule.js";
import AuditEvent from "../models/AuditEvent.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.get("/staff", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const staff = await User.find({ role: { $in: ["OPERATOR", "TRIAGE_LEAD"] } }).select("-password");
  res.json(staff);
});

router.get("/rules", requireAuth, async (req, res) => {
  const rules = await PriorityRule.find();
  res.json(rules);
});

router.patch("/rules/:id/toggle", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const rule = await PriorityRule.findById(req.params.id);
  if (!rule) return res.status(404).json({ error: "Rule not found" });
  rule.enabled = !rule.enabled;
  await rule.save();
  res.json(rule);
});

router.patch("/rules/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const rule = await PriorityRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!rule) return res.status(404).json({ error: "Rule not found" });
  res.json(rule);
});

router.get("/audit", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const events = await AuditEvent.find().sort({ time: -1 }).limit(100);
  res.json(events);
});

export default router;
